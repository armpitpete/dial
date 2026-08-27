(function (root, factory) {
  const stationsApi = root?.DialStations || (typeof require === "function" ? require("./stations.js") : null);
  const api = factory(stationsApi);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.DialDiscovery = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (DialStations) {
  "use strict";

  const API_ROOTS = [
    "https://de1.api.radio-browser.info",
    "https://nl1.api.radio-browser.info"
  ];
  const SEARCH_KINDS = ["name", "tag", "country", "language"];

  function normalizeSearchTerm(query, kind) {
    const term = String(query || "").trim();
    return kind === "tag" || kind === "language" ? term.toLocaleLowerCase() : term;
  }

  function buildSearchUrl(root, query, kind = "name", limit = 20) {
    const safeKind = SEARCH_KINDS.includes(kind) ? kind : "name";
    const params = new URLSearchParams({
      [safeKind]: normalizeSearchTerm(query, safeKind),
      hidebroken: "true",
      is_https: "true",
      order: "votes",
      reverse: "true",
      limit: String(Math.min(Math.max(Number(limit) || 20, 1), 50))
    });
    return `${root}/json/stations/search?${params.toString()}`;
  }

  async function fetchWithTimeout(url, fetchImpl, timeoutMs) {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      return await fetchImpl(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller?.signal
      });
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function searchStations(query, kind = "name", options = {}) {
    const term = String(query || "").trim();
    if (term.length < 2) throw new Error("Enter at least two characters to search.");
    const fetchImpl = options.fetchImpl || (typeof fetch === "function" ? fetch.bind(globalThis) : null);
    if (!fetchImpl) throw new Error("Station discovery is unavailable in this environment.");

    const roots = options.roots || API_ROOTS;
    const errors = [];
    let hadSuccessfulResponse = false;
    for (const root of roots) {
      try {
        const response = await fetchWithTimeout(buildSearchUrl(root, term, kind, options.limit || 20), fetchImpl, options.timeoutMs || 8000);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (!Array.isArray(payload)) throw new Error("Invalid station-directory response.");
        hadSuccessfulResponse = true;
        const seen = new Set();
        const stations = payload
          .map(DialStations.normalizeRadioBrowserStation)
          .filter(Boolean)
          .filter((station) => {
            if (seen.has(station.uuid)) return false;
            seen.add(station.uuid);
            return true;
          });
        if (stations.length) return stations;
      } catch (error) {
        errors.push(`${root}: ${error?.message || error}`);
      }
    }

    if (hadSuccessfulResponse) return [];
    throw new Error(`Station directory unavailable. ${errors.join("; ")}`);
  }

  return { API_ROOTS, SEARCH_KINDS, normalizeSearchTerm, buildSearchUrl, searchStations };
});
