(function (root, factory) {
  const stationsApi = root?.DialStations || (typeof require === "function" ? require("./stations.js") : null);
  const api = factory(stationsApi);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.DialLibrary = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (DialStations) {
  "use strict";

  const MAX_LIBRARY_SIZE = 500;

  function normalizeLibrary(values) {
    if (!Array.isArray(values)) return [];
    const seen = new Set();
    const normalized = [];
    for (const value of values) {
      const station = DialStations.normalizeStation(value);
      if (!station || seen.has(station.uuid)) continue;
      seen.add(station.uuid);
      normalized.push(station);
      if (normalized.length >= MAX_LIBRARY_SIZE) break;
    }
    return normalized;
  }

  function hasStation(values, uuid) {
    return normalizeLibrary(values).some((station) => station.uuid === uuid);
  }

  function addStation(values, value) {
    const station = DialStations.normalizeStation(value);
    const library = normalizeLibrary(values);
    if (!station) return { library, added: false, full: false };
    const existingIndex = library.findIndex((item) => item.uuid === station.uuid);
    if (existingIndex >= 0) {
      const next = [...library];
      next[existingIndex] = station;
      return { library: next, added: false, full: false };
    }
    if (library.length >= MAX_LIBRARY_SIZE) {
      return { library, added: false, full: true };
    }
    return { library: [station, ...library], added: true, full: false };
  }

  function removeStation(values, uuid) {
    return normalizeLibrary(values).filter((station) => station.uuid !== uuid);
  }

  function searchLibrary(values, query = "") {
    const library = normalizeLibrary(values);
    const term = String(query || "").trim().toLowerCase();
    if (!term) return library;
    return library.filter((station) => {
      const haystack = [station.name, station.description, station.country, station.language, station.codec, station.source, ...station.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  function chooseStation(values, currentUuid = null, random = Math.random) {
    const library = normalizeLibrary(values);
    if (!library.length) return null;
    const alternatives = currentUuid ? library.filter((station) => station.uuid !== currentUuid) : library;
    const pool = alternatives.length ? alternatives : library;
    const n = Number(random());
    const bounded = Number.isFinite(n) ? Math.min(Math.max(n, 0), 0.999999999) : 0;
    return pool[Math.floor(bounded * pool.length)];
  }

  return { MAX_LIBRARY_SIZE, normalizeLibrary, hasStation, addStation, removeStation, searchLibrary, chooseStation };
});
