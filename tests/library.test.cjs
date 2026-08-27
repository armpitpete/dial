const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { BUILT_IN_STATIONS } = require("../stations.js");
const { normalizeLibrary, hasStation, addStation, removeStation, searchLibrary, chooseStation, MAX_LIBRARY_SIZE } = require("../library.js");

const jazz = {
  uuid: "radio-browser:jazz",
  name: "Night Jazz",
  streamUrl: "https://example.test/jazz",
  description: "Late-night modern jazz.",
  country: "United Kingdom",
  language: "English",
  tags: ["jazz", "modern"],
  codec: "MP3",
  bitrate: 128,
  source: "radio-browser"
};

test("library normalizes and deduplicates canonical stations", () => {
  const library = normalizeLibrary([jazz, jazz, { broken: true }]);
  assert.equal(library.length, 1);
  assert.equal(library[0].uuid, jazz.uuid);
});

test("adding a station is idempotent and stores full records", () => {
  const first = addStation([], jazz);
  assert.equal(first.added, true);
  assert.equal(first.full, false);
  assert.equal(first.library[0].streamUrl, jazz.streamUrl);

  const second = addStation(first.library, { ...jazz, description: "Updated description" });
  assert.equal(second.added, false);
  assert.equal(second.full, false);
  assert.equal(second.library.length, 1);
  assert.equal(second.library[0].description, "Updated description");
});

test("full library refuses a new save without evicting existing stations", () => {
  const items = [];
  for (let i = 0; i < MAX_LIBRARY_SIZE; i++) {
    items.push({ ...jazz, uuid: `station:${i}`, name: `Station ${i}` });
  }
  const beforeFirst = items[0].uuid;
  const beforeLast = items[items.length - 1].uuid;
  const result = addStation(items, BUILT_IN_STATIONS[0]);
  assert.equal(result.added, false);
  assert.equal(result.full, true);
  assert.equal(result.library.length, MAX_LIBRARY_SIZE);
  assert.equal(result.library[0].uuid, beforeFirst);
  assert.equal(result.library[result.library.length - 1].uuid, beforeLast);
  assert.equal(result.library.some((station) => station.uuid === BUILT_IN_STATIONS[0].uuid), false);
});

test("library search matches name and metadata", () => {
  const library = [jazz, { ...BUILT_IN_STATIONS[0], tags: ["ambient"] }];
  assert.equal(searchLibrary(library, "night").length, 1);
  assert.equal(searchLibrary(library, "united kingdom").length, 1);
  assert.equal(searchLibrary(library, "ambient").length, 1);
  assert.equal(searchLibrary(library, "").length, 2);
});

test("remove does not affect unrelated stations", () => {
  const library = [jazz, BUILT_IN_STATIONS[0]];
  const result = removeStation(library, jazz.uuid);
  assert.equal(result.length, 1);
  assert.equal(result[0].uuid, BUILT_IN_STATIONS[0].uuid);
});

test("shuffle avoids the current station where possible", () => {
  const library = [jazz, BUILT_IN_STATIONS[0]];
  const picked = chooseStation(library, jazz.uuid, () => 0);
  assert.equal(picked.uuid, BUILT_IN_STATIONS[0].uuid);
});

test("library UI exposes save, search, browse, remove, shuffle and direct preset assignment", () => {
  const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
  for (const id of [
    "save-library-button",
    "shuffle-library-button",
    "library-form",
    "library-query",
    "library-panel",
    "previous-library-button",
    "play-library-button",
    "next-library-button",
    "remove-library-button",
    "clear-library-button",
    "library-preset-buttons"
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (let preset = 1; preset <= 6; preset++) {
    assert.match(html, new RegExp(`data-library-preset=["']${preset}["']`));
  }
});

test("library is persisted separately from presets", () => {
  const app = fs.readFileSync(require.resolve("../app.js"), "utf8");
  assert.match(app, /dial\.library\.v1/);
  assert.match(app, /dial\.presets\.v2/);
});

test("WebMCP library expansion remains deferred", () => {
  const app = fs.readFileSync(require.resolve("../app.js"), "utf8");
  assert.doesNotMatch(app, /name:\s*"save_station_to_library"/);
  assert.doesNotMatch(app, /name:\s*"search_saved_stations"/);
});

test("library membership recognizes canonical UUIDs", () => {
  assert.equal(hasStation([jazz], jazz.uuid), true);
  assert.equal(hasStation([jazz], "missing"), false);
});
