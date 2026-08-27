# v0.2 hostile review checklist

Before merge, challenge the candidate for:

- discovered presets becoming empty after reload
- HTTP/mixed-content streams entering state
- malformed provider rows poisoning presets
- provider outage breaking the built-in radio
- search changing station or playback without explicit play
- keyboard shortcuts firing while typing a search
- search results requiring visual scanning
- WebMCP bypassing the same state model used by the UI
- v1 presets being lost during migration
- unbounded directory responses

Any confirmed failure blocks merge.
