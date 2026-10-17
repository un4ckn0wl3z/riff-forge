# Riff Forge

A browser-local Guitar Pro → metal drum and bass generator. No API key or backend is required.

- Import `.gp`, `.gpx`, `.gp5`, `.gp4`, `.gp3` with vendored alphaTab 1.8.4.
- Select the rhythm reference track and Heavy Metal, Thrash, Metalcore, Djent, Death or Black Metal.
- Generate bass from the reference riff with Riff, Pocket or Driving approaches, including low B notes. Preview instrument toggles and export Full mix / Drums / Bass stems.
- Set kick density, complexity, riff following, humanization, double kick and fill frequency.
- Generate 2–6 seeded variations, regenerate individual takes and compare sample-based SoundFont drum previews.
- Export WAV audio (44.1 kHz / 16-bit stereo, full mix or individual instrument stems, maximum 10 minutes), or GM drum MIDI with tempo changes and time signatures; download all takes in a ZIP.
- Optional synthesized guitar reference during preview. Drums use bundled samples rendered from the SONiVOX SoundFont, including picked electric bass. Reference guitar remains synthesized and is not included in WAV exports.

Files remain in the visitor's browser. No upload, persistent user data, AI service, account integration, or remote soundfont is used. Fonts are optional web fonts with local fallbacks.

## Development

`dist/` is the complete static site. Serve it using an HTTP static server. A prebuilt classic JavaScript bundle is included, so running the app needs no build or dependency installation. To edit and rebuild the client, run `npm install` then `npm run build`. `npm test` validates the engine with a generated GP7 round-trip fixture, seeded composition, riff following, odd meters, tempo changes, MIDI parsing and long scores. `npm run check` validates module syntax. alphaTab license is distributed at `dist/vendor/ALPHATAB-LICENSE.txt`.

## Current limits

This is a rule-based composition engine, not a trained AI model. It analyzes selected-track onset timing and palm mute accents; it does not understand musical intent like a human drummer. Notes are processed in written bar order. Repeats, alternate endings, jumps, swing, grace notes and continuous tempo ramps are not expanded or interpreted. Discrete tempo changes and time signatures are included in MIDI. Files are limited to 20 MB and 512 measures. Input parsing is synchronous and very complex files may temporarily occupy the browser. Outputs are separate drum/bass MIDI tracks and WAV audio, not a modified GP file. DAW drum instruments should use General MIDI mapping.

## Verification

Programmatic engine and file-format checks pass. Interactive browser QA was unavailable in the build environment because the managed preview supervisor could not mount `/proc`.

## Drum audio

Bundled PCM samples are rendered from the SONiVOX SoundFont distributed with alphaTab 1.8.4. Attribution and source information are in `dist/samples/`. Rebuild with `node scripts/build-drum-kit.js /path/to/sonivox.sf2`. Playback loads local samples, and WAV is mixed in a dedicated module worker with the same timing, velocities and drum samples. WAV uses a soft limiter to avoid clipping. The preview uses a compressor, so final dynamics may differ slightly.

## Upload and startup compatibility fix

The page loads `boot.js` and a prebuilt `app.bundle.js` instead of importing the application module graph at startup. Application source and worker modules now use `.js` filenames to avoid `.mjs` MIME issues on basic static servers. The native upload input is visible and intentionally has no browser file-type filter; extensions are validated in the app, allowing GP files with unknown MIME types. FileReader is used when File.arrayBuffer is unavailable. Startup and uncaught errors are displayed on the page. `npm run test:ui` runs a browser-like DOM test of the exact production bundle, Demo, Generate, uploaded GP and FileReader fallback. Set `RIFF_FORGE_GP_FILE` to test a local fixture without adding that file to the repository. This does not replace real-browser QA, which remains unavailable in this environment.

## Select a bar range

After import, choose one-based inclusive From bar / To bar values (for example 9–16). Only that excerpt is composed, previewed and exported; the resulting MIDI/WAV starts at zero and should be placed at the original starting bar in the DAW. Filenames include the original bar numbers. Tempo active at the start and subsequent time-signature/tempo changes are retained. The written bar order is used; repeats are still not expanded. Click ทั้งเพลง to restore the full score. Staff rows are visual layout, so selection uses bar numbers.
