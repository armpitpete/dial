(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.DialStations = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const BUILT_IN_STATIONS = [
    ["groovesalad", "Groove Salad", "Ambient and downtempo beats.", "https://ice5.somafm.com/groovesalad-128-mp3"],
    ["dronezone", "Drone Zone", "Atmospheric ambient textures with minimal beats.", "https://ice5.somafm.com/dronezone-128-mp3"],
    ["secretagent", "Secret Agent", "Cinematic lounge, spy themes, and stylish instrumentals.", "https://ice5.somafm.com/secretagent-128-mp3"],
    ["indiepop", "Indie Pop Rocks!", "Independent pop and rock.", "https://ice5.somafm.com/indiepop-128-mp3"],
    ["deepspaceone", "Deep Space One", "Deep ambient electronic and space music.", "https://ice5.somafm.com/deepspaceone-128-mp3"],
    ["spacestation", "Space Station Soma", "Spaced-out ambient and mid-tempo electronica.", "https://ice5.somafm.com/spacestation-128-mp3"],
    ["u80s", "Underground 80s", "Early 1980s synthpop and new wave.", "https://ice5.somafm.com/u80s-128-mp3"],
    ["folkfwd", "Folk Forward", "Indie folk, alternative folk, and occasional classics.", "https://ice5.somafm.com/folkfwd-128-mp3"],
    ["sonicuniverse", "Sonic Universe", "Eclectic and avant-garde jazz.", "https://ice5.somafm.com/sonicuniverse-128-mp3"],
    ["reggae", "Heavyweight Reggae", "Reggae, ska, and rocksteady.", "https://ice5.somafm.com/reggae-128-mp3"],
    ["missioncontrol", "Mission Control", "Space-themed music celebrating NASA and exploration.", "https://ice5.somafm.com/missioncontrol-128-mp3"],
    ["7soul", "Seven Inch Soul", "Vintage soul from original 45 RPM records.", "https://ice5.somafm.com/7soul-128-mp3"]
  ].map(([id, name, description, streamUrl]) => ({
    uuid: `builtin:somafm:${id}`,
    legacyId: id,
    name,
    streamUrl,
    description,
    country: "",
    language: "",
    tags: [],
    codec: "MP3",
    bitrate: 128,
    source: "somafm"
  }));

  function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function cleanTags(value) {
    const list = Array.isArray(value) ? value : cleanText(value).split(",");
    return list.map(cleanText).filter(Boolean).slice(0, 12);
  }

  function normalizeStation(value) {
    if (!value || typeof value !== "object") return null;
    const uuid = cleanText(value.uuid);
    const name = cleanText(value.name);
    const streamUrl = cleanText(value.streamUrl);
    if (!uuid || !name || !/^https:\/\//i.test(streamUrl)) return null;

    return {
      uuid,
      legacyId: cleanText(value.legacyId) || null,
      name,
      streamUrl,
      description: cleanText(value.description),
      country: cleanText(value.country),
      language: cleanText(value.language),
      tags: cleanTags(value.tags),
      codec: cleanText(value.codec).toUpperCase(),
      bitrate: Number.isFinite(Number(value.bitrate)) ? Math.max(0, Number(value.bitrate)) : 0,
      source: cleanText(value.source) || "unknown"
    };
  }

  function normalizeRadioBrowserStation(raw) {
    if (!raw || typeof raw !== "object") return null;
    const uuid = cleanText(raw.stationuuid);
    const name = cleanText(raw.name);
    const streamUrl = [raw.url_resolved, raw.url]
      .map(cleanText)
      .find((value) => /^https:\/\//i.test(value)) || "";
    if (!uuid || !name || !streamUrl) return null;

    const country = cleanText(raw.country);
    const language = cleanText(raw.language);
    const tags = cleanTags(raw.tags);
    const pieces = [country, language, tags.slice(0, 3).join(", ")].filter(Boolean);

    return normalizeStation({
      uuid: `radio-browser:${uuid}`,
      name,
      streamUrl,
      description: pieces.join(". "),
      country,
      language,
      tags,
      codec: raw.codec,
      bitrate: raw.bitrate,
      source: "radio-browser"
    });
  }

  function builtInByLegacyId(id) {
    return BUILT_IN_STATIONS.find((station) => station.legacyId === id) || null;
  }

  function stationSummary(station) {
    const item = normalizeStation(station);
    if (!item) return "Unknown station.";
    const details = [];
    if (item.description) details.push(item.description.replace(/[.\s]+$/, ""));
    else {
      if (item.country) details.push(item.country);
      if (item.language) details.push(item.language);
      if (item.tags.length) details.push(item.tags.slice(0, 3).join(", "));
    }
    if (item.bitrate && item.codec) details.push(`${item.bitrate} kilobits ${item.codec}`);
    else if (item.codec) details.push(item.codec);
    return details.length ? `${item.name}. ${details.join(". ")}.` : `${item.name}.`;
  }

  return {
    BUILT_IN_STATIONS,
    normalizeStation,
    normalizeRadioBrowserStation,
    builtInByLegacyId,
    stationSummary
  };
});
