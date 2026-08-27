const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { BUILT_IN_STATIONS, normalizeStation, normalizeRadioBrowserStation, builtInByLegacyId, stationSummary } = require("../stations.js");
const { buildSearchUrl, searchStations } = require("../discovery.js");

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

test("station search remains clearable after submission", () => {
  const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
  assert.ok(html.includes("onsubmit=\"document.getElementById('clear-search-button').disabled=false\""));
});

test("station and discovery modules load before app", () => {
  const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
  assert.ok(html.indexOf('src="stations.js"') < html.indexOf('src="discovery.js"'));
  assert.ok(html.indexOf('src="discovery.js"') < html.indexOf('src="app.js"'));
});
