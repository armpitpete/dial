# Implementation notes

The v0.2 candidate intentionally keeps DIAL static and dependency-free.

- Built-in stations remain a small fallback catalogue.
- External discovery is isolated in `discovery.js`.
- Station normalization and persistence shape live in `stations.js`.
- `app.js` owns interaction state and WebMCP registration.
- No backend, framework, account system, or recommendation layer is introduced.
