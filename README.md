# DIAL

**Blind-first internet radio. Tune by listening, not looking.**

DIAL is a small, local-first internet radio designed around listening, keyboard operation, screen readers, persistent presets, station discovery, and WebMCP.

## Current milestone: Station Discovery v0.2

The fixed-catalogue MVP proved the core interaction. v0.2 turns DIAL into a real internet-radio navigator while keeping the architecture deliberately small.

### Core radio

- Play / stop
- Previous / next built-in station
- Back to the previous station
- Six persistent presets
- Save any current station to a preset
- Shuffle presets
- Shuffle built-in stations
- Keyboard-first controls
- Screen-reader-friendly semantic HTML and `aria-live` status
- WebMCP tools for the same radio actions

### Station discovery

- Search Radio Browser by station name, genre/tag, country, or language
- Request entries marked working and exposing HTTPS streams
- Inspect one result at a time instead of requiring a visual station grid
- Previous / next search result
- Play a discovered result
- Save discovered stations directly into the six persistent presets
- Preserve the full station record so discovered presets survive reloads
- Fall back between Radio Browser mirrors if one API host fails

Radio Browser is a discovery provider, not DIAL's identity. The built-in SomaFM catalogue remains the starter/fallback catalogue.

## Station model

Built-in, discovered, and persisted stations now share one record:

```text
uuid
name
streamUrl
description
country
language
tags
codec
bitrate
source
```

Old `dial.presets.v1` built-in preset IDs are migrated into `dial.presets.v2` station records on first load.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Opening `index.html` directly still works for the basic radio, but external discovery and WebMCP require an appropriate browser/network context.

## Keyboard

- `Space` — play / stop
- `Left` / `Right` — previous / next built-in station
- `1`–`6` — play preset
- `Shift` + `1`–`6` — save current station to preset
- `S` — shuffle presets
- `A` — shuffle built-in stations
- `B` — back to previous station
- `I` — announce current station
- `F` — focus station search

Search-result navigation also uses ordinary native controls, so Tab and Shift+Tab work without a special command vocabulary.

## WebMCP tools

DIAL feature-detects `document.modelContext` and the legacy `navigator.modelContext` surface.

Core tools:

- `get_radio_state`
- `play_radio`
- `stop_radio`
- `tune_radio`
- `shuffle_radio`
- `play_preset`
- `save_current_to_preset`
- `go_back_station`

Discovery tools:

- `search_radio_stations`
- `get_search_results`
- `play_search_result`

## Validation

No package install or build step is required.

```bash
node --check stations.js
node --check discovery.js
node --check app.js
node --test tests/*.test.cjs
```

The pull-request workflow runs the same checks automatically.

## v0.2 acceptance gate

Starting with no knowledge of the built-in catalogue:

1. Search for a station.
2. Find a station that is not one of the built-in SomaFM stations.
3. Listen to it.
4. Save it to preset 4.
5. Tune somewhere else.
6. Return to preset 4.
7. Reload DIAL.
8. Confirm preset 4 still restores the discovered station.
9. Complete the sequence using keyboard and screen reader.
10. Complete the equivalent discovery operation through WebMCP.

Passing this gate establishes DIAL as a genuine internet-radio product rather than a fixed demonstration catalogue.

## Deliberately deferred

- General station library beyond six presets
- Recommendations
- Recording / rewind / scheduled capture
- Accounts / sync
- Speech recognition / synthesis
- Rich track/programme metadata
- Backend infrastructure

Those wait until Station Discovery v0.2 passes hands-on acceptance.
