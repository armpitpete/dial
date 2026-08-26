# DIAL

**Blind-first internet radio. Tune by listening, not looking.**

This is the KISS MVP for DIAL.

## What is deliberately in v0.1

- Play / stop
- Previous / next station
- Back to the previous station
- Six persistent presets
- Save current station to a preset
- Shuffle presets
- Shuffle all demo stations
- Keyboard-first controls
- Screen-reader-friendly semantic HTML and `aria-live` status
- WebMCP tools for the same radio actions
- No framework
- No build step
- No account
- No backend

## What is deliberately NOT in v0.1

- Recording
- Live rewind/buffering
- Scheduled recordings
- Station-directory API
- Recommendations
- Accounts / sync
- Speech recognition
- Speech synthesis
- Track metadata
- Playlists
- Social/sharing features

Those wait until the basic radio passes hands-on listening and accessibility tests.

## Run locally

Any static HTTP server is enough:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Opening `index.html` directly also works for the normal radio UI, but WebMCP requires a compatible secure/browser context.

## Keyboard

- `Space` — play / stop
- `Left` / `Right` — previous / next station
- `1`–`6` — play preset
- `Shift` + `1`–`6` — save current station to preset
- `S` — shuffle presets
- `A` — shuffle all stations
- `B` — back to previous station
- `I` — announce current station

## WebMCP tools

The app feature-detects `document.modelContext.registerTool()` and otherwise behaves as a normal web radio.

Registered tools:

- `get_radio_state`
- `play_radio`
- `stop_radio`
- `tune_radio`
- `shuffle_radio`
- `play_preset`
- `save_current_to_preset`
- `go_back_station`

## Demo station catalogue

The MVP uses public SomaFM direct stream URLs so there is no directory/API dependency during the first listening pass.

For a real release, station-source terms and stream reliability need a dedicated review.

## First acceptance gate

Do not add features until this passes:

1. Open DIAL.
2. Start playback with keyboard only.
3. Tune next / previous without looking.
4. Save a station to preset 4.
5. Change stations.
6. Return to preset 4.
7. Shuffle presets.
8. Use Back and return to the immediately previous station.
9. Confirm every state change is understandable with a screen reader.
10. In a WebMCP-capable browser, have an agent tune, save a preset, shuffle, and go back.

Only after that: decide whether recording belongs in v0.2.
