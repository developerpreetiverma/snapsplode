// Real finger-snap detection: the mic hears a sharp click, the camera confirms a
// hand was just in the thumb-on-middle-finger pose. Neither alone counts, which
// is what rejects claps, door slams and speech. Audio is analysed live and never
// stored or sent anywhere.

const HIGHPASS_HZ = 1800;
const ONSET_RATIO = 6; // how far above the room's noise floor a click must jump
const MIN_PEAK = 0.035;
const DECAY_CHECK_MS = 70; // a snap has died away by now; speech and claps ring on
const DECAY_RATIO = 0.55;
const POSE_WINDOW_MS = 900;
const COOLDOWN_MS = 500;

// Pure click detector, fed one peak level per animation frame.
export class TransientDetector {
  constructor() {
    this.floor = 0.005;
    this.pending = null;
    this.lastHit = -Infinity;
  }

  // Returns true on the frame a click is confirmed.
  feed(peak, now) {
    if (this.pending) {
      if (now - this.pending.t < DECAY_CHECK_MS) return false;
      const { level } = this.pending;
      this.pending = null;
      if (peak < level * DECAY_RATIO) { this.lastHit = now; return true; }
      return false;
    }
    const isOnset = peak > MIN_PEAK && peak > this.floor * ONSET_RATIO && now - this.lastHit > COOLDOWN_MS;
    if (isOnset) { this.pending = { t: now, level: peak }; return false; }
    // Noise floor rises slowly and falls quickly, so a loud moment doesn't deafen it.
    this.floor += (peak - this.floor) * (peak > this.floor ? 0.02 : 0.2);
    this.floor = Math.max(0.002, this.floor);
    return false;
  }
}

export class SnapDetector {
  constructor(onSnap) {
    this.onSnap = onSnap;
    this.transients = new TransientDetector();
    this.mode = 'gesture';
    this.lastPose = -Infinity;
    this.heldSince = null;
    this.lastFire = -Infinity;
    this.heardWithoutHand = 0;
  }

  async attachMic(stream) {
    const ctx = new AudioContext();
    await ctx.resume();
    const source = ctx.createMediaStreamSource(stream);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = HIGHPASS_HZ;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(filter).connect(analyser);
    this.analyser = analyser;
    this.buffer = new Float32Array(analyser.fftSize);
    this.mode = 'mic';
  }

  // Call once per frame with every tracked hand.
  update(hands, now) {
    const ready = hands.some((h) => h.snapReady);
    if (ready) this.lastPose = now;

    if (this.mode === 'mic') {
      this.analyser.getFloatTimeDomainData(this.buffer);
      let peak = 0;
      for (const v of this.buffer) if (Math.abs(v) > peak) peak = Math.abs(v);
      if (this.transients.feed(peak, now)) {
        if (now - this.lastPose <= POSE_WINDOW_MS) this.fire(now);
        else this.heardWithoutHand = now;
      }
      return;
    }

    // No microphone: touching thumb to middle finger and flicking away counts.
    const touching = hands.some((h) => h.thumbMiddle < 0.3);
    if (touching && this.heldSince === null) this.heldSince = now;
    if (!touching && this.heldSince !== null) {
      const held = now - this.heldSince;
      this.heldSince = null;
      if (held > 90 && held < 1500) this.fire(now);
    }
  }

  fire(now) {
    if (now - this.lastFire < COOLDOWN_MS) return;
    this.lastFire = now;
    this.onSnap();
  }
}
