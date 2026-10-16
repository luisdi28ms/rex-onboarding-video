# Rex 101 — onboarding video

A ~7 minute narrated explainer for new Rex beta members, built from the Rex docs.

## Files

- `scenes.js`: the script. Each scene has `say` (voice-over lines) and `render` (animation).
  Inside `render`, `c.p(k)` eases from 0 to 1 when voice line `k` starts, so visuals stay in sync.
- `lib.js`: visual components (terminal windows, code boxes, keycaps, the mascot, badges).
- `index.html`: the stage. Open it in a browser to debug a frame with `setup(...)` and `renderFrame(t)`.
- `build-audio.mjs`: voices every line with macOS `say` and writes `out/timeline.json`, `out/voice.wav` and `out/captions.srt`.
- `render.mjs`: drives headless Chrome frame by frame and encodes `out/rex-onboarding.mp4`.

## Rebuild

```sh
npm install
node build-audio.mjs              # after any change to a `say` line
node render.mjs --stills 10,120   # preview frames at given seconds -> out/still-*.png
node render.mjs                   # full render (~10-20 min)
```

Options: `VOICE=Daniel RATE=170 node build-audio.mjs` changes the voice, and `FPS=24 node render.mjs` renders faster.
To use a human or AI voice instead, replace the clips in `out/clips/` (same text → same file name),
or swap `say` for your TTS of choice in `clip()`.
