# DIAL

**Blind-first internet radio. Tune by listening, not looking.**

DIAL is a static, local-first internet radio built around listening, discovery, saved stations, presets, keyboard control, screen-reader clarity, and optional WebMCP control.

## Current capabilities

- Play / stop
- Previous / next built-in station
- Back to the previous station
- Six persistent presets
- Save current station to any preset
- Shuffle presets
- Shuffle built-in stations
- Internet station discovery by name, genre/tag, country, and language
- One-result-at-a-time blind-first discovery
- Persistent discovered stations in presets
- Persistent saved-station library
- Search and browse saved stations
- Shuffle saved stations
- Remove saved stations without altering presets
- Assign any saved station directly to one of the six presets
- Keyboard-first controls
- Screen-reader-friendly semantic HTML and `aria-live` status
- Existing WebMCP radio/discovery tools
- No framework
- No build step
- No account
- No backend

## Station sources

The built-in starter catalogue uses public SomaFM direct streams.

Station discovery uses Radio Browser through a small replaceable provider adapter. DIAL accepts HTTPS stream URLs for its HTTPS-hosted production context.

Presets and the saved-station library store complete canonical station records locally in the browser so discovered stations survive reloads without becoming dependent on the built-in catalogue.

## Keyboard

- `Space` — play / stop
- `Left` / `Right` — previous / next built-in station
- `1`–`6` — play preset
- `Shift` + `1`–`6` — save current station to preset
- `S` — shuffle presets
- `A` — shuffle built-in stations
- `B` — back to previous station
- `I` — announce current station
- `F` — focus internet station search
- `L` — focus saved-station search

## WebMCP

The existing WebMCP surface remains unchanged during Station Library v0.3. Library-specific agent controls are deliberately deferred.

## Run locally

Any static HTTP server is enough:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Validation

```bash
node --check stations.js
node --check discovery.js
node --check library.js
node --check app.js
node --test tests/*.test.cjs
```

See `ROADMAP.md` for the product sequence.
