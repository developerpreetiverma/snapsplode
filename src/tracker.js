// Sends each new camera frame to the worker exactly once. If a frame arrives while
// the worker is busy, the newest frame goes as soon as it's free, so results never
// queue up and lag behind your hand, and no time is spent re-tracking an old frame.
export class HandTracker {
  constructor(video, onHands) {
    this.video = video;
    this.onHands = onHands;
    this.busy = false;
    this.waiting = false;
    this.ms = 0;
    this.rate = 0;
    this.delegate = '';
    this.frames = [];
    this.lastTs = 0;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.worker = new Worker('/hand-worker.js');
      this.worker.onerror = (e) => reject(new Error(e.message || 'Hand tracking worker failed'));
      this.worker.onmessage = ({ data }) => {
        if (data.type === 'ready') {
          this.delegate = data.delegate;
          resolve();
          this.watch();
        } else if (data.type === 'error') {
          reject(new Error(data.message));
        } else if (data.type === 'hands') {
          this.busy = false;
          this.ms = data.ms;
          const now = performance.now();
          this.frames.push(now);
          while (this.frames.length && now - this.frames[0] > 1000) this.frames.shift();
          this.rate = this.frames.length;
          this.onHands(data.hands, now);
          if (this.waiting) this.send();
        } else if (data.type === 'frame-error') {
          console.warn('Hand tracking frame failed:', data.message);
        }
      };
      this.worker.postMessage({ type: 'init' });
    });
  }

  watch() {
    const { video } = this;
    if (video.requestVideoFrameCallback) {
      const onFrame = () => { this.send(); video.requestVideoFrameCallback(onFrame); };
      video.requestVideoFrameCallback(onFrame);
    } else {
      setInterval(() => this.send(), 1000 / 30);
    }
  }

  async send() {
    const { video } = this;
    if (this.busy) { this.waiting = true; return; }
    if (video.readyState < 2 || video.paused) return;
    this.busy = true;
    this.waiting = false;
    const bitmap = await createImageBitmap(video);
    // MediaPipe requires strictly increasing timestamps.
    const timestamp = Math.max(this.lastTs + 1, Math.round(performance.now()));
    this.lastTs = timestamp;
    this.worker.postMessage({ type: 'frame', bitmap, timestamp }, [bitmap]);
  }
}
