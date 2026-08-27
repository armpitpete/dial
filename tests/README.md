# Tests

Run the dependency-free regression suite with:

```bash
node --test tests/*.test.cjs
```

The suite covers station normalization, legacy preset compatibility, HTTPS-only discovery filtering, Radio Browser mirror fallback, result deduplication, and the required discovery controls/script order.
