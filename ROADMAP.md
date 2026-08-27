# DIAL Roadmap

## Product direction

DIAL is a blind-first internet radio for discovering, navigating, remembering, and returning to stations by listening rather than browsing visually.

## v0.1 — Core radio foundation

**Status: complete**

- Playback and tuning
- Back
- Six persistent presets
- Preset and built-in shuffle
- Keyboard-first controls
- Screen-reader announcements
- WebMCP control
- Static deployment

## v0.2 — Station discovery

**Status: complete**

- Canonical station model
- Radio Browser discovery provider
- Search by name, tag, country, and language
- One-result-at-a-time blind-first navigation
- Persistent discovered presets
- v1 preset migration
- WebMCP search and result playback
- Automated validation

Real WebMCP-capable-browser acceptance is deferred; the implementation remains present.

## v0.3 — Station library

**Status: complete**

Separate long-term station memory from the six rapid-access presets.

- Save current station to library
- Remove saved station
- Search/browse saved stations
- Shuffle saved stations
- Assign saved station directly to any preset
- Keep library persistence separate from preset persistence
- Preserve keyboard and screen-reader operation
- Do not expand WebMCP in this milestone

Acceptance completed: discover or tune a station, save it to the library, leave it, find it again after reload, assign it directly to preset 4, remove it from the library, and verify preset 4 is preserved and playable.

## v0.3.1 — Discovery start and browse UX

**Current milestone**

Make a large station directory easy to enter without requiring a directory-style visual list.

- Optional first-run starting choice; no account and no compulsory onboarding
- Start from country, music, news/talk, around the world, surprise, or skip
- Quick Find routes for country, genre, language, and station name
- Continent exploration with country choices and “start somewhere” behavior
- Recent discovery choices stored locally on this device
- Every route feeds the existing one-result-at-a-time Radio Browser result flow
- Keep direct text search available
- Do not pretend that a sampled continent start is an exhaustive continent-wide station query
- Do not expand WebMCP in this milestone

## v0.4 — Reliability and station health

- Failed-stream detection
- Alternate URL/re-resolution support
- Preserve unavailable presets and saved stations
- Health timestamps
- Avoid repeatedly selecting known failures

## v0.5 — Discovery intelligence

Bounded and explainable exploration only after basic discovery is reliable.

- More like this
- Different from this
- Same country/language/genre
- Something completely different
- Not played recently
- Consider Popular and deeper Surprise behavior using reliability-aware ranking

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
