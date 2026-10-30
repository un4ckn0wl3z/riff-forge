# Riff Forge

A browser-local Guitar Pro → drum and bass generator for metal, rock, funk, shuffle, reggae and more. No API key or backend is required.

- Import `.gp`, `.gpx`, `.gp5`, `.gp4`, `.gp3` with vendored alphaTab 1.8.4. Repeats, alternate endings and jumps are played in Guitar Pro order (can be switched off).
- Select the rhythm reference track and a genre from five families (see **Genres** below): Metal, Rock, Groove, Swing and Other.
- Generate bass from the reference riff with Riff, Pocket, Driving, Root & octave, Root & fifth, Funk sixteenths, Boogie, One drop or Long held notes, including low B notes. *Vary per take* uses the genre's own approaches. Preview instrument toggles and export Full mix / Drums / Bass stems.
- Set kick density, complexity, riff following, humanization, double kick and fill frequency.
- Generate 2–6 seeded variations, regenerate individual takes and compare sample-based SoundFont drum previews.
- Pick a bar range on the bar map (tap first and last bar, drag, shift-click or a section chip) and give sections their own style, intensity, complexity and double kick.
- Export WAV audio (44.1 kHz / 16-bit stereo, full mix, individual instrument stems, a click stem, or full mix + click, maximum 10 minutes), or GM drum MIDI with tempo changes and time signatures; download all takes in a ZIP. Excerpts can start at the song start so files drop at 0:00 in a DAW.
- Preview with an optional click and a one-bar count-in.
- Thai / English interface: switch with **TH / EN** in the header. The first visit follows the browser language and the choice is remembered.
- Optional synthesized guitar reference during preview. Drums use bundled samples rendered from the SONiVOX SoundFont, including picked electric bass. Reference guitar remains synthesized and is not included in WAV exports.

Files remain in the visitor's browser. No upload, persistent user data, AI service, account integration, or remote soundfont is used. Fonts are optional web fonts with local fallbacks.

## Development

`dist/` is the complete static site. Serve it using an HTTP static server. A prebuilt classic JavaScript bundle is included, so running the app needs no build or dependency installation. To edit and rebuild the client, run `npm install` then `npm run build`. `npm test` validates the engine with a generated GP7 round-trip fixture, seeded composition, riff following, odd meters, tempo changes, MIDI parsing, long scores, repeat/ending playback order, section overrides, song-start alignment and click stems with sample-accurate onsets. `npm run test:browser` drives the real site in Chromium with Playwright (upload, repeats, bar map, overrides, preview, aligned WAV/MIDI exports, measured click timing, and an English pass that fails if any Thai text is left); it is skipped when Playwright is not installed. `npm run check` validates module syntax. alphaTab license is distributed at `dist/vendor/ALPHATAB-LICENSE.txt`.

## Current limits

This is a rule-based composition engine, not a trained AI model. It analyzes selected-track onset timing and palm mute accents; it does not understand musical intent like a human drummer. Bars follow Guitar Pro's playback order (repeats, alternate endings and jumps, computed by alphaTab's MIDI generator) unless Follow repeats & endings is off. Swing, grace notes and continuous tempo ramps are not interpreted. Discrete tempo changes and time signatures are included in MIDI. Files are limited to 20 MB and 512 written measures (2048 played). Input parsing is synchronous and very complex files may temporarily occupy the browser. Outputs are separate drum/bass MIDI tracks and WAV audio, not a modified GP file. DAW drum instruments should use General MIDI mapping.

## Verification

Programmatic engine and file-format checks pass (`npm test`, `npm run test:ui`). `npm run test:browser` runs the production site in headless Chromium and checks the exported click WAV lands within 2 ms of the tempo map.

## Drum audio

Bundled PCM samples are rendered from the SONiVOX SoundFont distributed with alphaTab 1.8.4. Attribution and source information are in `dist/samples/`. Rebuild with `node scripts/build-drum-kit.js /path/to/sonivox.sf2`. Playback loads local samples, and WAV is mixed in a dedicated module worker with the same timing, velocities and drum samples. WAV uses a soft limiter to avoid clipping. The preview uses a compressor, so final dynamics may differ slightly.

## Upload and startup compatibility fix

The page loads `boot.js` and a prebuilt `app.bundle.js` instead of importing the application module graph at startup. Application source and worker modules now use `.js` filenames to avoid `.mjs` MIME issues on basic static servers. The native upload input is visible and intentionally has no browser file-type filter; extensions are validated in the app, allowing GP files with unknown MIME types. FileReader is used when File.arrayBuffer is unavailable. Startup and uncaught errors are displayed on the page. `npm run test:ui` runs a browser-like DOM test of the exact production bundle, Demo, Generate, uploaded GP and FileReader fallback. Set `RIFF_FORGE_GP_FILE` to test a local fixture without adding that file to the repository. This does not replace real-browser QA, which remains unavailable in this environment.

## Select a bar range

After import, pick bars on the bar map or type one-based inclusive From bar / To bar values (for example 9–16). Bar numbers follow playback order; when repeats are expanded the written bar number is shown in brackets. Only that excerpt is composed, previewed and exported. **Export start** decides where the file begins: *Song start* (default) keeps the full tempo map and time signatures and adds silence before the excerpt, so MIDI/WAV drop at 0:00 in the DAW; *Selected bar* starts the file at zero, to be placed at the original starting bar. Filenames include the original bar numbers. Tempo active at the start and subsequent time-signature/tempo changes are retained. The written bar order is used; repeats are still not expanded. Click ทั้งเพลง to restore the full score. Staff rows are visual layout, so selection uses bar numbers.

## EZbass MIDI mapping

Choose MIDI bass target → EZbass (+12 semitones) when exporting to EZbass. This adjusts only the bass note-on/off pitches and suppresses the General MIDI program change. Drum notes, velocity, timing and note lengths remain unchanged. Standard / General MIDI is the default. Playback and WAV continue using the original sounding pitches. Files exported with the EZbass profile include `_EZbass` in their name; do not transpose them a second time on import. This profile addresses the octave mismatch confirmed by comparing a supplied Riff Forge audio export (first note approximately 55 Hz) with its EZbass render (approximately 27.5 Hz).

## Genres

Pick a family tab, then a genre. Metal genres keep the original riff-driven generator unchanged. The other families have their own rules:

| Family | Genres | Feel |
|---|---|---|
| Metal | Heavy, Thrash, Metalcore, Djent, Death, Black | Riff-following kick, double kick, blasts, breakdowns |
| Rock | Hard Rock, Classic Rock, Pop Rock, Punk / Pop-punk | Backbeat on 2 and 4, accented eighth hats, crashes on sections; punk's second take is the skank beat |
| Groove | Funk, R&B / Soul | Sixteenth hats, ghost notes on the snare, syncopated kick, funk bass |
| Swing | Blues Shuffle, Rock 'n' Roll | Triplet feel, ride with pedal hat on the backbeat, boogie bass, triplet fills |
| Other | Reggae (One Drop), Ballad / Half-time | One drop / rockers / steppers with cross-stick on 3; half-time snare on 3 and long bass notes |

Choosing a genre outside metal (or switching family) loads that genre's starting Intensity, Complexity and Double kick; adjust them afterwards as you like. Switching between metal genres keeps your settings. The three takes are *tight pocket with closed hats*, *ride cymbal*, and *open-hat accents*.

Bars marked with **triplet feel** (8th or 16th) in Guitar Pro swing in every genre: drums, bass and the reference guitar move the off-beat to the last triplet. 3/4, 6/8 (backbeat on the dotted-quarter pulse) and odd meters such as 7/8 are supported.

The kit adds cross-stick (37), pedal hi-hat (44) and ride bell (53) to the original pieces; MIDI uses the same General MIDI drum notes.

## Section overrides

Select bars on the bar map, choose a genre (grouped by family; choosing one loads its starting values), intensity, complexity and double kick under **Section overrides**, then press **+ ใช้กับ bar …**. Overridden bars are underlined in orange on the map. Overrides use full-song bar numbers, so they also apply when you generate only part of the song; later overrides win where they overlap. Remove one with ×.

To generate only those sections, set **Generate** (under the bar range) to one of:

- *Only override bars — keep gaps silent*: overrides on bars 5–8 and 17–20 produce drums and bass for just those bars, and bars 9–16 stay silent. With Export start = Song start the files still line up at 0:00 in the DAW.
- *Only override bars — join, remove gaps*: bars 5–8 are followed directly by 17–20 (8 bars in total). Each range starts at the tempo it has in the song and keeps its own meters and tempo changes. Files start at 0 and are named like `_bars5-8+17-20`, and Export start has no effect.

## Click and count-in

Each take can preview with **Click** (accent on the downbeat, compound x/8 bars click on dotted quarters) and a one-bar **Count-in**. Export **Click** or **Full mix + click** as WAV, or as MIDI on channel 10 (Hi Wood Block 76 for the downbeat, Low Wood Block 77 for other beats). The click covers the selected bars only.

## Preview timing

Preview scheduling runs on a Web Worker tick, so playback stays steady when the tab is in the background (main-thread timers there are slowed to about once a second). Notes the scheduler has already missed are skipped instead of being played late in a burst.
