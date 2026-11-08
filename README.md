# SnapSplode

Snap your fingers to summon one of 33 objects out of 200,000 particles, then pull it apart with your bare hands. Snap again to make it vanish.

## Run it

```bash
npm install
npm run dev
```

Open the address it prints in Chrome and allow the camera and microphone. Everything runs on your computer; video and audio are never recorded or uploaded.

## Gestures

| Gesture | What it does |
|---|---|
| Snap | Show the object (it swarms in and assembles), or make it vanish. Nothing else shows or hides it |
| Fist | Close it back up, and carry it |
| Open hand | Pull it apart; how far follows how open your hand is |
| Point | Highlight a part and read about it |
| Peace ✌️ | Next object, running on into the next category. If nothing is shown, it lines up what the next snap brings |
| Three fingers 🤟 | Previous object (index, middle and ring up, pinky folded) |
| Pinch with both hands | Stretch to zoom; tilt or move together to rotate |

Hand markers are subtle by default (faint fingertip dots), so attention stays on the object. Switch between Off, Subtle and Full in the side panel, or press H.

If the microphone is blocked, touch your thumb to your middle finger and flick away instead of snapping.

## Tips

- Keep your whole hand in view, with light on it and not behind you.
- Snaps count only if the camera saw your thumb near your middle finger just before, so claps and noises don't trigger it. Snap in view of the camera.

## Code map

- `src/catalog/`: the 33 objects, each built from named parts in code
- `src/geometry.js`: shapes the objects are made from
- `src/particles.js`: the particle shader
- `src/gestures.js`, `src/snap.js`: gesture and snap detection
- `public/hand-worker.js`: hand tracking, off the main thread
- `src/main.js`: app state and frame loop

`npm test` runs the catalog, gesture and snap tests.
