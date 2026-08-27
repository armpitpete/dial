const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { BUILT_IN_STATIONS, normalizeStation, normalizeRadioBrowserStation, builtInByLegacyId, stationSummary } = require("../stations.js");
const { normalizeSearchTerm, normalizeFilters, buildSearchUrl, searchStations } = require("../discovery.js");

test("built-in stations use canonical persistent records", () => {
  assert.equal(BUILT_IN_STATIONS.length, 12);
  assert.equal(BUILT_IN_STATIONS[0].uuid, "builtin:somafm:groovesalad");
  assert.match(BUILT_IN_STATIONS[0].streamUrl, /^https:\/\//);
});

test("legacy preset ids resolve to built-in station records", () => {
  assert.equal(builtInByLegacyId("dronezone").name, "Drone Zone");
  assert.equal(builtInByLegacyId("missing"), null);
});

test("Radio Browser records normalize to canonical stations", () => {
  const station = normalizeRadioBrowserStation({
    stationuuid: "abc-123",
    name: " Example FM ",
    url: "http://fallback.invalid/stream",
    url_resolved: "https://stream.example/radio.mp3",
    country: "United Kingdom",
    language: "english",
    tags: "jazz, experimental, late night",
    codec: "mp3",
    bitrate: 192
  });
  assert.equal(station.uuid, "radio-browser:abc-123");
  assert.equal(station.streamUrl, "https://stream.example/radio.mp3");
  assert.deepEqual(station.tags, ["jazz", "experimental", "late night"]);
  assert.equal(station.codec, "MP3");
});

test("Radio Browser normalization falls back to an HTTPS raw URL", () => {
  const station = normalizeRadioBrowserStation({
    stationuuid: "abc-456",
    name: "Fallback FM",
    url_resolved: "http://resolved.invalid/stream",
    url: "https://secure.example/stream"
  });
  assert.equal(station.streamUrl, "https://secure.example/stream");
});

test("insecure streams are rejected for the HTTPS app", () => {
  assert.equal(normalizeStation({ uuid: "x", name: "X", streamUrl: "http://example.test" }), null);
});

test("built-in spoken summary keeps the musical description", () => {
  const summary = stationSummary(BUILT_IN_STATIONS[0]);
  assert.match(summary, /Ambient and downtempo beats/);
  assert.match(summary, /128 kilobits MP3/);
});

test("search URL requests working HTTPS stations and bounds results", () => {
  const url = new URL(buildSearchUrl("https://example.test", "jazz", "tag", 20));
  assert.equal(url.pathname, "/json/stations/search");
  assert.equal(url.searchParams.get("tag"), "jazz");
  assert.equal(url.searchParams.get("hidebroken"), "true");
  assert.equal(url.searchParams.get("is_https"), "true");
  assert.equal(url.searchParams.get("limit"), "20");
});

test("genre and language directory terms are normalized to lowercase", () => {
  assert.equal(normalizeSearchTerm("Electronic", "tag"), "electronic");
  assert.equal(normalizeSearchTerm("English", "language"), "english");
  assert.equal(normalizeSearchTerm("United Kingdom", "country"), "United Kingdom");
  const url = new URL(buildSearchUrl("https://example.test", "Electronic", "tag", 20));
  assert.equal(url.searchParams.get("tag"), "electronic");
});

test("country genre language and name filters combine in one directory request", () => {
  assert.deepEqual(normalizeFilters({
    country: "United Kingdom",
    tag: "Electronic",
    language: "English",
    name: "Dance"
  }), {
    country: "United Kingdom",
    tag: "electronic",
    language: "english",
    name: "Dance"
  });
  const url = new URL(buildSearchUrl("https://example.test", "Electronic", "tag", 20, {
    country: "United Kingdom",
    language: "English",
    name: "Dance"
  }));
  assert.equal(url.searchParams.get("country"), "United Kingdom");
  assert.equal(url.searchParams.get("tag"), "electronic");
  assert.equal(url.searchParams.get("language"), "english");
  assert.equal(url.searchParams.get("name"), "Dance");
});

test("discovery passes cumulative filters to the directory", async () => {
  let requestedUrl = "";
  const fetchImpl = async (url) => {
    requestedUrl = url;
    return { ok: true, async json() { return [{ stationuuid: "u1", name: "UK Electronic", url_resolved: "https://stream.test/one", country: "United Kingdom", tags: "electronic" }]; } };
  };
  const results = await searchStations("Electronic", "tag", {
    fetchImpl,
    roots: ["https://only.test"],
    filters: { country: "United Kingdom", language: "English" }
  });
  const url = new URL(requestedUrl);
  assert.equal(url.searchParams.get("country"), "United Kingdom");
  assert.equal(url.searchParams.get("tag"), "electronic");
  assert.equal(url.searchParams.get("language"), "english");
  assert.equal(results[0].name, "UK Electronic");
});

test("discovery falls back to the next API mirror", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url.startsWith("https://first.test")) throw new Error("offline");
    return { ok: true, async json() { return [{ stationuuid: "u1", name: "Station One", url_resolved: "https://stream.test/one", tags: "ambient" }]; } };
  };
  const results = await searchStations("station", "name", { fetchImpl, roots: ["https://first.test", "https://second.test"], timeoutMs: 100 });
  assert.equal(calls.length, 2);
  assert.equal(results[0].name, "Station One");
});

test("discovery also tries the next mirror when a successful response yields no usable HTTPS stations", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url.startsWith("https://first.test")) {
      return { ok: true, async json() { return [{ stationuuid: "u0", name: "HTTP Only", url_resolved: "http://stream.test/zero" }]; } };
    }
    return { ok: true, async json() { return [{ stationuuid: "u1", name: "Electronic One", url_resolved: "https://stream.test/one", tags: "electronic" }]; } };
  };
  const results = await searchStations("Electronic", "tag", { fetchImpl, roots: ["https://first.test", "https://second.test"], timeoutMs: 100 });
  assert.equal(calls.length, 2);
  assert.equal(results[0].name, "Electronic One");
  assert.match(calls[0], /tag=electronic/);
});

test("duplicate directory rows collapse by UUID", async () => {
  const row = { stationuuid: "u1", name: "Station One", url_resolved: "https://stream.test/one" };
  const fetchImpl = async () => ({ ok: true, json: async () => [row, row] });
  const results = await searchStations("station", "name", { fetchImpl, roots: ["https://only.test"] });
  assert.equal(results.length, 1);
});

test("discovery UI exposes keyboard-accessible native controls", () => {
  const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
  for (const id of ["discovery-form", "discovery-query", "discovery-kind", "previous-result-button", "play-result-button", "next-result-button", "clear-search-button"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test("station search clear control begins safely disabled", () => {
  const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
  assert.match(html, /id="clear-search-button"[^>]*disabled/);
  assert.match(fs.readFileSync(require.resolve("../app.js"), "utf8"), /clearSearchButton\.disabled = false/);
});

test("station, discovery, and library modules load before app", () => {
  const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
  assert.ok(html.indexOf('src="stations.js"') < html.indexOf('src="discovery.js"'));
  assert.ok(html.indexOf('src="discovery.js"') < html.indexOf('src="library.js"'));
  assert.ok(html.indexOf('src="library.js"') < html.indexOf('src="app.js"'));
});
