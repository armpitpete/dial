# Station Library v0.3 acceptance

Exact-head candidate must pass automated validation and the following browser checks before merge.

Browser evidence completed:
- visual long-name containment for current/search result: PASS after repair
- save current discovered station to library: PASS (1 saved station visible)
- ordinary preset save remains functional: PASS (discovered station saved to preset 6 during testing)

Remaining browser checks:
1. Confirm a duplicate library save does not create a duplicate.
2. Tune elsewhere.
3. Search or browse the saved-station library and return to the saved station.
4. Reload DIAL.
5. Confirm the station is still in the library.
6. Assign that saved station directly to preset 4 without first needing to play it.
7. Remove the station from the library.
8. Confirm preset 4 still contains the station and remains playable.
9. Confirm saved-station shuffle never fails when the library contains at least one valid station.
10. Complete the library sequence using keyboard/tab navigation and screen-reader announcements.
11. Recheck that pathological station names are visually bounded in preset buttons while the full accessible label remains intact.

WebMCP library-specific controls are explicitly outside this milestone.
