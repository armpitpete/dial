# DIAL Roadmap

## Product direction

DIAL is a blind-first internet radio for discovering, navigating, remembering, and returning to stations by listening rather than browsing visually.

## v0.1 — Core radio foundation

Status: complete enough to freeze feature work.

- Playback and tuning
- Back
- Six persistent presets
- Preset and built-in shuffle
- Keyboard-first controls
- Screen-reader announcements
- WebMCP control
- Static deployment

## v0.2 — Station discovery

Current milestone.

- Canonical station model
- Radio Browser discovery provider
- Search by name, tag, country, and language
- One-result-at-a-time blind-first navigation
- Persistent discovered presets
- v1 preset migration
- WebMCP search and result playback
- Automated validation

Acceptance: discover a non-built-in station, play it, save it to preset 4, leave it, restore it, reload DIAL, restore it again, then repeat the discovery path using keyboard/screen reader and WebMCP.

## v0.3 — Station library

Separate long-term station memory from the six rapid-access presets.

- Save/remove station
- Search saved stations
- Shuffle saved stations
- Assign saved station to preset

## v0.4 — Reliability and station health

- Failed-stream detection
- Alternate URL/re-resolution support
- Preserve unavailable presets
- Health timestamps
- Avoid repeatedly selecting known failures

## v0.5 — Discovery intelligence

Bounded and explainable exploration only after basic discovery is reliable.

- More like this
- Different from this
- Same country/language/genre
- Something completely different
- Not played recently

## v0.6 — Metadata and listening history

- Current track/programme where available
- Station website/location
- Recently played stations
- Longer Back history

## v0.7 — Recording investigation

Investigate live rewind, manual/scheduled recording, storage, browser limitations, and legal/licensing implications before deciding whether to implement them.

## v0.8 — Optional sync

Local-first remains the default. Add accounts/backend only if cross-device station state proves worth the complexity.

## v1.0 criterion

DIAL should be better at navigating internet radio without sight than a conventional radio-directory website is with sight.
