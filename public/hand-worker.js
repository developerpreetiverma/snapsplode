// Runs hand tracking off the main thread so a slow detection never stalls drawing.
// Classic worker: the MediaPipe loader relies on importScripts.
var module = { exports: {} };
var exports = module.exports;
// Paths are relative to this file, so the app works from any folder (e.g. GitHub Pages' /snapsplode/).
const asset = (path) => new URL(path, self.location.href).href;
importScripts(asset('mediapipe/vision_bundle.js'));
const { FilesetResolver, HandLandmarker } = module.exports;

let landmarker = null;

async function create(fileset, delegate) {
  return HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: asset('models/hand_landmarker.task'), delegate },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

async function init() {
  const fileset = await FilesetResolver.forVisionTasks(asset('mediapipe/wasm'));
  try {
    landmarker = await create(fileset, 'GPU');
    return 'GPU';
  } catch (err) {
    landmarker = await create(fileset, 'CPU');
    return 'CPU';
  }
}

self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    try {
      const delegate = await init();
      self.postMessage({ type: 'ready', delegate });
    } catch (err) {
      self.postMessage({ type: 'error', message: String(err) });
    }
    return;
  }
  if (data.type === 'frame') {
    const started = performance.now();
    let hands = [];
    try {
      const r = landmarker.detectForVideo(data.bitmap, data.timestamp);
      hands = r.landmarks.map((image, i) => ({
        image,
        world: r.worldLandmarks[i],
        side: r.handedness[i]?.[0]?.categoryName,
      }));
    } catch (err) {
      self.postMessage({ type: 'frame-error', message: String(err) });
    }
    data.bitmap.close();
    self.postMessage({ type: 'hands', hands, ms: performance.now() - started });
  }
};
