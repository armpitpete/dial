# DIAL Station Discovery v0.2 Acceptance

## Manual browser gate

1. Open the exact candidate build.
2. Press `F` to focus station search.
3. Search for a station not in the built-in SomaFM catalogue.
4. Move between results using native controls only.
5. Play one discovered result and confirm audible playback.
6. Save it to preset 4.
7. Tune to another station.
8. Play preset 4 and confirm the discovered station returns.
9. Reload the page and confirm preset 4 still restores it.
10. Repeat with a screen reader and confirm result position, station details, playback state, and save state are understandable.

## WebMCP gate

1. Discover the DIAL tools.
2. Call `search_radio_stations` for a non-built-in station or genre.
3. Inspect `get_search_results`.
4. Call `play_search_result`.
5. Call `save_current_to_preset` for preset 4.
6. Tune elsewhere and call `play_preset` for preset 4.
7. Confirm the discovered station is restored.

## Pass condition

The candidate passes only when both browser/accessibility and WebMCP paths succeed at the same exact head.
