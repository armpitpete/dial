(() => {
  "use strict";

  const { BUILT_IN_STATIONS, normalizeStation, builtInByLegacyId, stationSummary } = window.DialStations;
  const { SEARCH_KINDS, searchStations } = window.DialDiscovery;

  const STORAGE_KEY = "dial.presets.v2";
  const LEGACY_STORAGE_KEY = "dial.presets.v1";
  const DEFAULT_PRESETS = [BUILT_IN_STATIONS[0], BUILT_IN_STATIONS[1], BUILT_IN_STATIONS[2], null, null, null];

  const audio = document.getElementById("audio");
  const stationName = document.getElementById("station-name");
  const stationDescription = document.getElementById("station-description");
  const stationSource = document.getElementById("station-source");
  const playbackState = document.getElementById("playback-state");
  const status = document.getElementById("status");
  const playButton = document.getElementById("play-button");
  const previousButton = document.getElementById("previous-button");
  const nextButton = document.getElementById("next-button");
  const backButton = document.getElementById("back-button");
  const shufflePresetsButton = document.getElementById("shuffle-presets-button");
  const shuffleAllButton = document.getElementById("shuffle-all-button");
  const presetButtons = document.getElementById("preset-buttons");
  const savePresetForm = document.getElementById("save-preset-form");
  const presetNumber = document.getElementById("preset-number");
  const discoveryForm = document.getElementById("discovery-form");
  const discoveryQuery = document.getElementById("discovery-query");
  const discoveryKind = document.getElementById("discovery-kind");
  const discoveryPanel = document.getElementById("discovery-panel");
  const discoveryName = document.getElementById("discovery-name");
  const discoveryDescription = document.getElementById("discovery-description");
  const discoveryPosition = document.getElementById("discovery-position");
  const previousResultButton = document.getElementById("previous-result-button");
  const nextResultButton = document.getElementById("next-result-button");
  const playResultButton = document.getElementById("play-result-button");
  const clearSearchButton = document.getElementById("clear-search-button");

  let currentStation = BUILT_IN_STATIONS[0];
  let previousStation = null;
  let shouldBePlaying = false;
  let presets = loadPresets();
  let discoveryResults = [];
  let discoveryIndex = -1;
  let lastSearch = null;

  function loadPresets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 6) return parsed.map((value) => normalizeStation(value));
      }
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        if (Array.isArray(legacy) && legacy.length === 6) {
          const migrated = legacy.map((id) => typeof id === "string" ? builtInByLegacyId(id) : null);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }
    } catch {}
    return DEFAULT_PRESETS.map((station) => station ? { ...station } : null);
  }

  function savePresets() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(presets)); }
    catch { announce("Preset changed for this session. Browser storage is unavailable."); }
  }

  function announce(message) {
    status.textContent = "";
    window.setTimeout(() => { status.textContent = message; }, 20);
  }

  function sourceLabel(station) {
    if (station.source === "radio-browser") return "Discovered station";
    if (station.source === "somafm") return "Built-in station";
    return "Saved station";
  }

  function describeCurrentStation(prefix = "") {
    const playing = shouldBePlaying && !audio.paused ? "Playing" : "Stopped";
    const message = `${prefix}${stationSummary(currentStation)} ${playing}.`;
    announce(message);
    return message;
  }

  function updateUI() {
    stationName.textContent = currentStation.name;
    stationDescription.textContent = currentStation.description || stationSummary(currentStation);
    stationSource.textContent = sourceLabel(currentStation);
    const isPlaying = shouldBePlaying && !audio.paused;
    playbackState.textContent = isPlaying ? "Playing" : (shouldBePlaying ? "Connecting…" : "Stopped");
    playButton.textContent = shouldBePlaying ? "Stop" : "Play";
    backButton.disabled = !previousStation;
    shufflePresetsButton.disabled = !presets.some(Boolean);
    renderPresets();
  }

  function renderPresets() {
    presetButtons.replaceChildren();
    presets.forEach((station, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.preset = String(index + 1);
      button.disabled = !station;
      button.textContent = station ? `${index + 1}. ${station.name}` : `${index + 1}. Empty`;
      button.setAttribute("aria-label", station ? `Play preset ${index + 1}, ${station.name}` : `Preset ${index + 1}, empty`);
      button.addEventListener("click", () => { if (station) playPreset(index + 1); });
      presetButtons.appendChild(button);
    });
  }

  async function setStation(station, { autoplay = shouldBePlaying, reason = "Tuned to " } = {}) {
    const next = normalizeStation(station);
    if (!next) throw new Error("Invalid station.");
    if (currentStation.uuid !== next.uuid) previousStation = currentStation;
    currentStation = next;
    audio.src = next.streamUrl;
    updateUI();
    if (autoplay) {
      shouldBePlaying = true;
      try { await audio.play(); updateUI(); describeCurrentStation(reason); }
      catch { shouldBePlaying = false; updateUI(); announce(`${next.name}. Playback was blocked or the stream is unavailable. Press Play to try again.`); }
    } else describeCurrentStation(reason);
    return next;
  }

  async function play() {
    if (!audio.src) audio.src = currentStation.streamUrl;
    shouldBePlaying = true;
    updateUI();
    try { await audio.play(); updateUI(); return describeCurrentStation("Playing "); }
    catch { shouldBePlaying = false; updateUI(); const message = `${currentStation.name}. Playback was blocked or the stream is unavailable.`; announce(message); return message; }
  }

  function stop() { shouldBePlaying = false; audio.pause(); updateUI(); const message = `Stopped ${currentStation.name}.`; announce(message); return message; }
  async function togglePlayback() { return shouldBePlaying ? stop() : play(); }

  async function tune(direction) {
    let index = BUILT_IN_STATIONS.findIndex((station) => station.uuid === currentStation.uuid);
    if (index < 0) index = direction === "previous" ? 0 : -1;
    const delta = direction === "previous" ? -1 : 1;
    const nextIndex = (index + delta + BUILT_IN_STATIONS.length) % BUILT_IN_STATIONS.length;
    return setStation(BUILT_IN_STATIONS[nextIndex], { autoplay: true, reason: "Tuned to " });
  }

  async function goBack() {
    if (!previousStation) { const message = "No previous station yet."; announce(message); return message; }
    return setStation(previousStation, { reason: "Back to " });
  }

  async function shuffleAll() {
    const alternatives = BUILT_IN_STATIONS.filter((station) => station.uuid !== currentStation.uuid);
    const pool = alternatives.length ? alternatives : BUILT_IN_STATIONS;
    return setStation(pool[Math.floor(Math.random() * pool.length)], { autoplay: true, reason: "Shuffled to " });
  }

  async function shufflePresets() {
    const available = presets.map((station, index) => ({ station, preset: index + 1 })).filter((item) => item.station);
    if (!available.length) { const message = "No presets have been saved."; announce(message); return message; }
    const alternatives = available.filter((item) => item.station.uuid !== currentStation.uuid);
    const pool = alternatives.length ? alternatives : available;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    await setStation(choice.station, { autoplay: true, reason: `Preset ${choice.preset}. ` });
    return `Playing preset ${choice.preset}, ${choice.station.name}.`;
  }

  async function playPreset(number) {
    const index = Number(number) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= presets.length) throw new Error("Preset must be between 1 and 6.");
    const station = presets[index];
    if (!station) { const message = `Preset ${number} is empty.`; announce(message); return message; }
    await setStation(station, { autoplay: true, reason: `Preset ${number}. ` });
    return `Playing preset ${number}, ${station.name}.`;
  }

  function savePreset(number) {
    const index = Number(number) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= presets.length) throw new Error("Preset must be between 1 and 6.");
    presets[index] = { ...currentStation, tags: [...currentStation.tags] };
    savePresets(); updateUI();
    const message = `Saved ${currentStation.name} to preset ${number}.`; announce(message); return message;
  }

  function currentDiscoveryResult() { return discoveryIndex >= 0 ? discoveryResults[discoveryIndex] : null; }

  function renderDiscoveryResult({ announceResult = true } = {}) {
    const station = currentDiscoveryResult();
    const hasResults = Boolean(station);
    discoveryPanel.hidden = !hasResults;
    previousResultButton.disabled = !hasResults || discoveryResults.length < 2;
    nextResultButton.disabled = !hasResults || discoveryResults.length < 2;
    playResultButton.disabled = !hasResults;
    clearSearchButton.disabled = !hasResults && !lastSearch;
    if (!station) return;
    discoveryName.textContent = station.name;
    discoveryDescription.textContent = stationSummary(station);
    discoveryPosition.textContent = `Result ${discoveryIndex + 1} of ${discoveryResults.length}`;
    if (announceResult) announce(`${stationSummary(station)} Result ${discoveryIndex + 1} of ${discoveryResults.length}.`);
  }

  async function performSearch(query, kind = "name") {
    const safeKind = SEARCH_KINDS.includes(kind) ? kind : "name";
    const term = String(query || "").trim();
    lastSearch = { query: term, kind: safeKind };
    discoveryPanel.hidden = false;
    discoveryName.textContent = "Searching…";
    discoveryDescription.textContent = `Searching by ${safeKind}.`;
    discoveryPosition.textContent = "";
    announce(`Searching stations by ${safeKind} for ${term}.`);
    try {
      discoveryResults = await searchStations(term, safeKind);
      discoveryIndex = discoveryResults.length ? 0 : -1;
      if (!discoveryResults.length) {
        discoveryName.textContent = "No stations found"; discoveryDescription.textContent = "Try a broader search."; discoveryPosition.textContent = ""; announce(`No stations found for ${term}.`); return [];
      }
      renderDiscoveryResult(); return discoveryResults;
    } catch (error) {
      discoveryResults = []; discoveryIndex = -1; discoveryName.textContent = "Search unavailable"; discoveryDescription.textContent = error?.message || "Station directory unavailable."; discoveryPosition.textContent = ""; announce(discoveryDescription.textContent); return [];
    }
  }

  function moveDiscoveryResult(direction) {
    if (!discoveryResults.length) return null;
    const delta = direction === "previous" ? -1 : 1;
    discoveryIndex = (discoveryIndex + delta + discoveryResults.length) % discoveryResults.length;
    renderDiscoveryResult(); return currentDiscoveryResult();
  }

  async function playDiscoveryResult(number = discoveryIndex + 1) {
    const index = Number(number) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= discoveryResults.length) throw new Error("Search result is out of range.");
    discoveryIndex = index; renderDiscoveryResult({ announceResult: false });
    return setStation(discoveryResults[index], { autoplay: true, reason: `Search result ${index + 1}. ` });
  }

  function clearSearch() { discoveryResults = []; discoveryIndex = -1; lastSearch = null; discoveryQuery.value = ""; discoveryPanel.hidden = true; announce("Station search cleared."); }

  function radioState() {
    return {
      station: currentStation,
      playback: shouldBePlaying && !audio.paused ? "playing" : (shouldBePlaying ? "connecting" : "stopped"),
      previousStation: previousStation?.name || null,
      presets: presets.map((station, index) => ({ number: index + 1, station })),
      discovery: { query: lastSearch?.query || null, kind: lastSearch?.kind || null, count: discoveryResults.length, currentResult: discoveryIndex >= 0 ? discoveryIndex + 1 : null }
    };
  }

  function toolText(text) { return { content: [{ type: "text", text }] }; }

  async function registerWebMCPTools() {
    const modelContext = document.modelContext || navigator.modelContext;
    if (!modelContext || typeof modelContext.registerTool !== "function") return;
    const tools = [
      { name: "get_radio_state", description: "Get DIAL's current station, playback state, previous station, six presets, and discovery state.", inputSchema: { type: "object", properties: {} }, annotations: { readOnlyHint: true }, execute: async () => toolText(JSON.stringify(radioState())) },
      { name: "play_radio", description: "Start playing the station DIAL is currently tuned to.", inputSchema: { type: "object", properties: {} }, execute: async () => toolText(await play()) },
      { name: "stop_radio", description: "Stop DIAL playback without changing the tuned station.", inputSchema: { type: "object", properties: {} }, execute: async () => toolText(stop()) },
      { name: "tune_radio", description: "Tune DIAL to the next or previous station in its built-in starter catalogue.", inputSchema: { type: "object", properties: { direction: { type: "string", enum: ["next", "previous"] } }, required: ["direction"] }, execute: async ({ direction }) => toolText(`Tuned to ${(await tune(direction)).name}.`) },
      { name: "shuffle_radio", description: "Tune DIAL to a random station from either saved presets or the built-in starter catalogue.", inputSchema: { type: "object", properties: { scope: { type: "string", enum: ["presets", "all"] } }, required: ["scope"] }, execute: async ({ scope }) => scope === "presets" ? toolText(await shufflePresets()) : toolText(`Shuffled to ${(await shuffleAll()).name}.`) },
      { name: "play_preset", description: "Play one of DIAL's six saved radio presets.", inputSchema: { type: "object", properties: { preset: { type: "integer", minimum: 1, maximum: 6 } }, required: ["preset"] }, execute: async ({ preset }) => toolText(await playPreset(preset)) },
      { name: "save_current_to_preset", description: "Save the current built-in or discovered station into one of DIAL's six preset slots.", inputSchema: { type: "object", properties: { preset: { type: "integer", minimum: 1, maximum: 6 } }, required: ["preset"] }, execute: async ({ preset }) => toolText(savePreset(preset)) },
      { name: "go_back_station", description: "Return DIAL to the station that was tuned immediately before the current station.", inputSchema: { type: "object", properties: {} }, execute: async () => toolText(await goBack()) },
      { name: "search_radio_stations", description: "Search the internet radio directory by station name, genre/tag, country, or language without starting playback.", inputSchema: { type: "object", properties: { query: { type: "string", minLength: 2 }, kind: { type: "string", enum: SEARCH_KINDS } }, required: ["query", "kind"] }, execute: async ({ query, kind }) => { const results = await performSearch(query, kind); return toolText(results.length ? `Found ${results.length} stations. ${stationSummary(results[0])}` : `No stations found for ${query}.`); } },
      { name: "get_search_results", description: "Get the current DIAL station-search results.", inputSchema: { type: "object", properties: {} }, annotations: { readOnlyHint: true }, execute: async () => toolText(JSON.stringify(discoveryResults.map((station, index) => ({ result: index + 1, ...station })))) },
      { name: "play_search_result", description: "Play one result from DIAL's current station search.", inputSchema: { type: "object", properties: { result: { type: "integer", minimum: 1, maximum: 20 } }, required: ["result"] }, execute: async ({ result }) => toolText(`Playing ${(await playDiscoveryResult(result)).name}.`) }
    ];
    for (const tool of tools) {
      try { await modelContext.registerTool(tool); }
      catch (error) { console.warn(`DIAL WebMCP tool registration failed: ${tool.name}`, error); }
    }
  }

  playButton.addEventListener("click", togglePlayback);
  previousButton.addEventListener("click", () => tune("previous"));
  nextButton.addEventListener("click", () => tune("next"));
  backButton.addEventListener("click", goBack);
  shufflePresetsButton.addEventListener("click", shufflePresets);
  shuffleAllButton.addEventListener("click", shuffleAll);
  previousResultButton.addEventListener("click", () => moveDiscoveryResult("previous"));
  nextResultButton.addEventListener("click", () => moveDiscoveryResult("next"));
  playResultButton.addEventListener("click", () => playDiscoveryResult());
  clearSearchButton.addEventListener("click", clearSearch);
  discoveryForm.addEventListener("submit", (event) => { event.preventDefault(); performSearch(discoveryQuery.value, discoveryKind.value); });
  savePresetForm.addEventListener("submit", (event) => { event.preventDefault(); savePreset(presetNumber.value); });

  audio.addEventListener("playing", updateUI);
  audio.addEventListener("pause", updateUI);
  audio.addEventListener("waiting", updateUI);
  audio.addEventListener("error", () => { shouldBePlaying = false; updateUI(); announce(`${currentStation.name} is unavailable right now. The station has not been removed from your presets.`); });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isEditable = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
    const isInteractive = target instanceof Element && Boolean(target.closest("button, a, summary"));
    if (isEditable || isInteractive) return;
    if (event.code === "Space") { event.preventDefault(); togglePlayback(); return; }
    if (event.key === "ArrowLeft") { event.preventDefault(); tune("previous"); return; }
    if (event.key === "ArrowRight") { event.preventDefault(); tune("next"); return; }
    if (/^Digit[1-6]$/.test(event.code)) { event.preventDefault(); const preset = event.code.slice(-1); if (event.shiftKey) savePreset(preset); else playPreset(preset); return; }
    const key = event.key.toLowerCase();
    if (key === "s") { event.preventDefault(); shufflePresets(); }
    else if (key === "a") { event.preventDefault(); shuffleAll(); }
    else if (key === "b") { event.preventDefault(); goBack(); }
    else if (key === "i") { event.preventDefault(); describeCurrentStation(); }
    else if (key === "f") { event.preventDefault(); discoveryQuery.focus(); }
  });

  audio.src = currentStation.streamUrl;
  updateUI();
  renderDiscoveryResult({ announceResult: false });
  registerWebMCPTools();
})();
