# Station Discovery v0.2

## Goal

Turn DIAL from a fixed demonstration catalogue into a real blind-first internet-radio navigator.

## Flow

```text
search
→ one normalized result at a time
→ previous / next result
→ play
→ save to preset
→ reload
→ restore saved discovered station
```

## Provider boundary

Radio Browser is the first discovery provider. DIAL owns the station model and interaction model so the provider can later be replaced or supplemented.

Directory requests are bounded to 20 results, exclude entries marked broken, and request HTTPS streams because the production DIAL page is HTTPS.

## Persistence

Presets store complete canonical station records under `dial.presets.v2`. Existing v1 built-in station IDs are migrated on load.

## Deferred

A general station library, recommendation logic, metadata enrichment, recording, accounts, and backend infrastructure are explicitly outside this milestone.
