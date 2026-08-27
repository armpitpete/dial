# Discovery start and browse v0.3.1 acceptance

Exact-head candidate must pass automated validation and the following browser checks before merge.

## First-run start

1. With `dial.start.v1` absent, reload DIAL and confirm the optional “Where should we begin?” panel appears.
2. Confirm Skip dismisses it without changing presets, saved stations, or current station state.
3. Use Starting choices to reopen it.
4. Confirm My country uses the browser locale only when an explicit region is available; otherwise it routes to Country search without requesting location permission.
5. Confirm Music exposes useful genre choices.
6. Confirm News & Talk exposes useful spoken-word choices.
7. Confirm Around the world moves into continent exploration.
8. Confirm Surprise me selects a country-based discovery route rather than altering saved state.

## Browse

1. Country, Genre, Language, and Station name must all feed the existing Radio Browser search form.
2. Continent must expose Europe, Africa, Asia, North America, South America, and Oceania.
3. Choosing a continent must expose country choices plus “Start somewhere in <continent>”.
4. “Start somewhere” must transparently choose a country within the selected continent; it must not claim to be an exhaustive continent-wide search.
5. Direct text search must remain available and unchanged.
6. Search results must remain one station at a time with Previous / Play / Next controls.

## Recent choices

1. Complete at least two different searches and confirm they appear under Recent choices.
2. Repeat an existing search and confirm it moves to the front rather than duplicating.
3. Reload and confirm recent choices persist locally.
4. Confirm recent choices are bounded to six entries.

## Accessibility and regression

1. Complete the start → browse → result path with keyboard/tab navigation.
2. Confirm focus moves to a useful next control when opening a choice panel.
3. Confirm existing live-region search announcements still occur.
4. Confirm preset and Station Library persistence are unchanged.
5. Confirm no account, geolocation permission, backend, or WebMCP expansion was introduced.
