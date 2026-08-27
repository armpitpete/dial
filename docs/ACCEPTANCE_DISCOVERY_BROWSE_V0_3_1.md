# Discovery start and browse v0.3.1 acceptance

Exact-head candidate must pass automated validation and the following browser checks before merge.

## Browser evidence recorded

- Optional first-run “Where should we begin?” panel: PASS.
- Progressive disclosure initial state: PASS.
- My country → United Kingdom → Radio Browser results: PASS.
- Genre → Electronic → usable Radio Browser result: PASS after mirror/normalization repair.
- Electronic result playback: PASS (`Dance Wave!` playing).
- Only one secondary browse panel remains open and the selected panel collapses after search: PASS.
- Language → English → Radio Browser result: PASS.
- Station name → `Heart 80s` → Radio Browser result: PASS.
- Recent choices contains multiple distinct searches and persists across candidate reloads: PASS.
- Repeating `Genre: Electronic` moves it to the front without duplication: PASS.
- Continent → Europe → Start somewhere in Europe: PASS; DIAL transparently selected Ukraine, returned a Ukrainian station result, added `Country: Ukraine` to Recent choices, and collapsed the continent panel.
- Selected browse state remains anchored at the original Find/Explore control and is visibly highlighted for partial-sight users (for example `Country: United Kingdom`): PASS.
- Selected browse state also exposes programmatic pressed/selected semantics for assistive technology: automated/code-review PASS.
- Cumulative `Country: United Kingdom` + `Genre: Electronic` filtering: PASS; both selected states remain highlighted and the returned result uses the combined filters.
- Clear search removes the whole cumulative active filter set and both selected states: PASS.
- Volume control visible while playing and retained at 35% across candidate reload/head change: PASS.
- 35% is audibly quieter than 100%: PASS.
- 0% behaves as mute while preserving radio state: PASS.

## First-run start

1. With `dial.start.v1` absent, reload DIAL and confirm the optional “Where should we begin?” panel appears. **PASS**
2. Confirm Skip dismisses it without changing presets, saved stations, or current station state. **Implementation/code-review PASS; no state-mutation path is called.**
3. Use Starting choices to reopen it. **Implementation/code-review PASS.**
4. Confirm My country uses the browser locale only when an explicit region is available; otherwise it routes to Country search without requesting location permission. **PASS for explicit `en-GB` / United Kingdom path; fallback behavior automated/code-reviewed.**
5. Confirm Music exposes useful genre choices. **PASS**
6. Confirm News & Talk exposes useful spoken-word choices. **Implementation/code-review PASS.**
7. Confirm Around the world moves into continent exploration. **Equivalent continent entry path browser-proven; implementation/code-review PASS for Starting-choice route.**
8. Confirm Surprise me selects a country-based discovery route rather than altering saved state. **Implementation/code-review PASS.**

## Browse

1. Country, Genre, Language, and Station name must all feed the existing Radio Browser search form. **PASS**
2. Country, Genre, Language, and Station name must be cumulative filters rather than mutually exclusive choices. Selecting another filter must retain previously active filters and send them together in one Radio Browser request. **PASS.**
3. Each active filter must remain highlighted at its original top-level control, so combinations such as `Country: United Kingdom` + `Genre: Electronic` are visible without scanning down the page. **PASS.**
4. Clear search must clear the whole active filter set and its selected presentation. **PASS.**
5. Continent must expose Europe, Africa, Asia, North America, South America, and Oceania. **PASS from automated contract; Europe path browser-proven.**
6. Choosing a continent must expose country choices plus “Start somewhere in <continent>”. **PASS for Europe; common implementation covers all six.**
7. “Start somewhere” must transparently choose a country within the selected continent; it must not claim to be an exhaustive continent-wide search. **PASS: Europe selected Ukraine.**
8. Direct text search must remain available and unchanged. **PASS via station-name search.**
9. Search results must remain one station at a time with Previous / Play / Next controls. **PASS**
10. The active browse selection must remain visually anchored at the top-level Find/Explore control after results appear, with a strong selected state suitable for partial sight. **PASS for single and cumulative filters.**

## Recent choices

1. Complete at least two different searches and confirm they appear under Recent choices. **PASS**
2. Repeat an existing search and confirm it moves to the front rather than duplicating. **PASS**
3. Reload and confirm recent choices persist locally. **PASS visually across candidate reloads.**
4. Confirm recent choices are bounded to six entries. **Automated contract PASS.**

## Volume

1. Confirm the native 0–100% slider changes audible level while a station is playing. **PASS**
2. Set a non-default level, reload DIAL, and confirm the value persists locally. **PASS at 35%.**
3. Confirm 0% behaves as mute without changing station, preset, or library state. **PASS**

## Accessibility and regression

1. Complete the start → browse → result path with keyboard/tab navigation. **REMAINING PHYSICAL ACCEPTANCE.**
2. Confirm focus moves to a useful next control when opening a choice panel. **REMAINING PHYSICAL ACCEPTANCE.**
3. Confirm existing live-region search announcements still occur. **REMAINING SCREEN-READER ACCEPTANCE.**
4. Confirm preset and Station Library persistence are unchanged. **Existing persistence behavior visually intact; no persistence code changed by this slice.**
5. Confirm no account, geolocation permission, backend, or WebMCP expansion was introduced. **Automated/code review PASS.**

Exact-head validation must be rerun after any evidence-only commit before merge authorization.
