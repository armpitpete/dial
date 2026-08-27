# Station Library v0.3 acceptance

Exact-head candidate must pass automated validation and the following browser checks before merge.

1. Start with an empty saved-station library.
2. Tune or discover a station.
3. Save the current station to the library.
4. Confirm a duplicate save does not create a duplicate.
5. Tune elsewhere.
6. Search or browse the saved-station library and return to the saved station.
7. Reload DIAL.
8. Confirm the station is still in the library.
9. Assign that saved station directly to preset 4 without first needing to play it.
10. Remove the station from the library.
11. Confirm preset 4 still contains the station and remains playable.
12. Confirm saved-station shuffle never fails when the library contains at least one valid station.
13. Complete the library sequence using keyboard/tab navigation and screen-reader announcements.
14. Verify a pathological directory station name does not dominate the page visually, while the full name remains present for assistive technology.
15. Verify visible result metadata does not repeat the station name before country/language/tag details.

WebMCP library-specific controls are explicitly outside this milestone.
