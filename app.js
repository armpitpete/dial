(() => {
  "use strict";

  const stations = [
    {
      id: "groovesalad",
      name: "Groove Salad",
      description: "Ambient and downtempo beats.",
      stream: "https://ice5.somafm.com/groovesalad-128-mp3"
    },
    {
      id: "dronezone",
      name: "Drone Zone",
      description: "Atmospheric ambient textures with minimal beats.",
      stream: "https://ice5.somafm.com/dronezone-128-mp3"
    },
    {
      id: "secretagent",
      name: "Secret Agent",
      description: "Cinematic lounge, spy themes, and stylish instrumentals.",
      stream: "https://ice5.somafm.com/secretagent-128-mp3"
    },
    {
      id: "indiepop",
      name: "Indie Pop Rocks!",
      description: "Independent pop and rock.",
      stream: "https://ice5.somafm.com/indiepop-128-mp3"
    },
    {
      id: "deepspaceone",
      name: "Deep Space One",
      description: "Deep ambient electronic and space music.",
      stream: "https://ice5.somafm.com/deepspaceone-128-mp3"
    },
    {
      id: "spacestation",
      name: "Space Station Soma",
      description: "Spaced-out ambient and mid-tempo electronica.",
      stream: "https://ice5.somafm.com/spacestation-128-mp3"
    },
    {
      id: "u80s",
      name: "Underground 80s",
      description: "Early 1980s synthpop and new wave.",
      stream: "https://ice5.somafm.com/u80s-128-mp3"
    },
    {
      id: "folkfwd",
      name: "Folk Forward",
      description: "Indie folk, alternative folk, and occasional classics.",
      stream: "https://ice5.somafm.com/folkfwd-128-mp3"
    },
    {
      id: "sonicuniverse",
      name: "Sonic Universe",
      description: "Eclectic and avant-garde jazz.",
      stream: "https://ice5.somafm.com/sonicuniverse-128-mp3"
    },
    {
      id: "reggae",
      name: "Heavyweight Reggae",
      description: "Reggae, ska, and rocksteady.",
      stream: "https://ice5.somafm.com/reggae-128-mp3"
    },
    {
      id: "missioncontrol",
      name: "Mission Control",
      description: "Space-themed music celebrating NASA and exploration.",
      stream: "https://ice5.somafm.com/missioncontrol-128-mp3"
    },
    {
      id: "7soul",
      name: "Seven Inch Soul",
      description: "Vintage soul from original 45 RPM records.",
      stream: "https://ice5.somafm.com/7soul-128-mp3"
    }
  ];

  const STORAGE_KEY = "dial.presets.v1";
  const DEFAULT_PRESETS = [
    "groovesalad",
    "dronezone",
    "secretagent",
    null,
    null,
    null
  ];

  const audio = document.getElementById("audio");
  const stationName = document.getElementById("station-name");
  const stationDescription = document.getElementById("station-description");
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

  let currentIndex = 0;
  let previousStationId = null;
  let shouldBePlaying = false;
  let presets = loadPresets();

  function loadPresets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...DEFAULT_PRESETS];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length !== 6) return [...DEFAULT_PRESETS];
      return parsed.map((id) => stations.some((station) => station.id === id) ? id : null);
    } catch {
      return [...DEFAULT_PRESETS];
    }
  }

  function savePresets() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch {
      announce("Preset changed for this session. Browser storage is unavailable.");
    }
  }

  function currentStation() {
    return stations[currentIndex];
  }

  function stationById(id) {
    return stations.find((station) => station.id === id) || null;
  }

  function announce(message) {
    status.textContent = "";
    window.setTimeout(() => {
      status.textContent = message;
    }, 20);
  }

  function describeCurrentStation(prefix = "") {
    const station = currentStation();
    const playing = shouldBePlaying && !audio.paused ? "Playing" : "Stopped";
    const message = `${prefix}${station.name}. ${station.description} ${playing}.`;
    announce(message);
    return message;
  }

  function updateUI() {
    const station = currentStation();
    stationName.textContent = station.name;
    stationDescription.textContent = station.description;
    const isPlaying = shouldBePlaying && !audio.paused;
    playbackState.textContent = isPlaying ? "Playing" : (shouldBePlaying ? "Connecting…" : "Stopped");
    playButton.textContent = shouldBePlaying ? "Stop" : "Play";
    backButton.disabled = !previousStationId;
    shufflePresetsButton.disabled = !presets.some(Boolean);
    renderPresets();
  }

  function renderPresets() {
    presetButtons.replaceChildren();
    presets.forEach((stationId, index) => {
      const station = stationById(stationId);
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.preset = String(index + 1);
      button.disabled = !station;
      button.textContent = station
        ? `${index + 1}. ${station.name}`
        : `${index + 1}. Empty`;
      button.setAttribute(
        "aria-label",
        station ? `Play preset ${index + 1}, ${station.name}` : `Preset ${index + 1}, empty`
      );
      button.addEventListener("click", () => {
        if (station) playPreset(index + 1);
      });
      presetButtons.appendChild(button);
    });
  }

  function rememberPrevious(nextStationId) {
    const currentId = currentStation().id;
    if (currentId !== nextStationId) {
      previousStationId = currentId;
    }
  }

  async function setStationByIndex(index, { autoplay = shouldBePlaying, reason = "Tuned to " } = {}) {
    const nextIndex = (index + stations.length) % stations.length;
    const next = stations[nextIndex];
    rememberPrevious(next.id);
    currentIndex = nextIndex;
    audio.src = next.stream;
    updateUI();

    if (autoplay) {
      shouldBePlaying = true;
      try {
        await audio.play();
        updateUI();
        describeCurrentStation(reason);
      } catch {
        shouldBePlaying = false;
        updateUI();
        announce(`${next.name}. Playback was blocked or the stream is unavailable. Press Play to try again.`);
      }
    } else {
      describeCurrentStation(reason);
    }

    return next;
  }

  async function setStationById(id, options = {}) {
    const index = stations.findIndex((station) => station.id === id);
    if (index < 0) throw new Error("Unknown station.");
    return setStationByIndex(index, options);
  }

  async function play() {
    if (!audio.src) audio.src = currentStation().stream;
    shouldBePlaying = true;
    updateUI();
    try {
      await audio.play();
      updateUI();
      return describeCurrentStation("Playing ");
    } catch {
      shouldBePlaying = false;
      updateUI();
      const message = `${currentStation().name}. Playback was blocked or the stream is unavailable.`;
      announce(message);
      return message;
    }
  }

  function stop() {
    shouldBePlaying = false;
    audio.pause();
    updateUI();
    const message = `Stopped ${currentStation().name}.`;
    announce(message);
    return message;
  }

  async function togglePlayback() {
    if (shouldBePlaying) return stop();
    return play();
  }

  async function tune(direction) {
    const delta = direction === "previous" ? -1 : 1;
    return setStationByIndex(currentIndex + delta, { autoplay: true, reason: "Tuned to " });
  }

  async function goBack() {
    if (!previousStationId) {
      const message = "No previous station yet.";
      announce(message);
      return message;
    }
    const targetId = previousStationId;
    return setStationById(targetId, { reason: "Back to " });
  }

  async function shuffleAll() {
    if (stations.length < 2) return currentStation();
    let index = currentIndex;
    while (index === currentIndex) {
      index = Math.floor(Math.random() * stations.length);
    }
    return setStationByIndex(index, { autoplay: true, reason: "Shuffled to " });
  }

  async function shufflePresets() {
    const available = presets
      .map((id, index) => ({ id, preset: index + 1 }))
      .filter((item) => item.id);

    if (!available.length) {
      const message = "No presets have been saved.";
      announce(message);
      return message;
    }

    const currentId = currentStation().id;
    const alternatives = available.filter((item) => item.id !== currentId);
    const pool = alternatives.length ? alternatives : available;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    await setStationById(choice.id, { autoplay: true, reason: `Preset ${choice.preset}. ` });
    return `Playing preset ${choice.preset}, ${stationById(choice.id).name}.`;
  }

  async function playPreset(number) {
    const index = Number(number) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= presets.length) {
      throw new Error("Preset must be between 1 and 6.");
    }

    const stationId = presets[index];
    if (!stationId) {
      const message = `Preset ${number} is empty.`;
      announce(message);
      return message;
    }

    await setStationById(stationId, { autoplay: true, reason: `Preset ${number}. ` });
    return `Playing preset ${number}, ${stationById(stationId).name}.`;
  }

  function savePreset(number) {
    const index = Number(number) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= presets.length) {
      throw new Error("Preset must be between 1 and 6.");
    }

    presets[index] = currentStation().id;
    savePresets();
    updateUI();
    const message = `Saved ${currentStation().name} to preset ${number}.`;
    announce(message);
    return message;
  }

  function radioState() {
    return {
      station: {
        id: currentStation().id,
        name: currentStation().name,
        description: currentStation().description
      },
      playback: shouldBePlaying && !audio.paused ? "playing" : (shouldBePlaying ? "connecting" : "stopped"),
      previousStation: stationById(previousStationId)?.name || null,
      presets: presets.map((id, index) => ({
        number: index + 1,
        station: stationById(id)?.name || null
      }))
    };
  }

  function toolText(text) {
    return { content: [{ type: "text", text }] };
  }

  async function registerWebMCPTools() {
    const modelContext = document.modelContext || navigator.modelContext;
    if (!modelContext || typeof modelContext.registerTool !== "function") {
      return;
    }

    const tools = [
      {
        name: "get_radio_state",
        description: "Get DIAL's current station, playback state, previous station, and six presets.",
        inputSchema: { type: "object", properties: {} },
        annotations: { readOnlyHint: true },
        execute: async () => toolText(JSON.stringify(radioState()))
      },
      {
        name: "play_radio",
        description: "Start playing the station DIAL is currently tuned to.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => toolText(await play())
      },
      {
        name: "stop_radio",
        description: "Stop DIAL playback without changing the tuned station.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => toolText(stop())
      },
      {
        name: "tune_radio",
        description: "Tune DIAL to the next or previous station in its catalogue.",
        inputSchema: {
          type: "object",
          properties: {
            direction: {
              type: "string",
              enum: ["next", "previous"],
              description: "Which direction to tune."
            }
          },
          required: ["direction"]
        },
        execute: async ({ direction }) => {
          const station = await tune(direction);
          return toolText(`Tuned to ${station.name}.`);
        }
      },
      {
        name: "shuffle_radio",
        description: "Tune DIAL to a random station from either saved presets or the whole demo catalogue.",
        inputSchema: {
          type: "object",
          properties: {
            scope: {
              type: "string",
              enum: ["presets", "all"],
              description: "Use only saved presets, or all available stations."
            }
          },
          required: ["scope"]
        },
        execute: async ({ scope }) => {
          if (scope === "presets") return toolText(await shufflePresets());
          const station = await shuffleAll();
          return toolText(`Shuffled to ${station.name}.`);
        }
      },
      {
        name: "play_preset",
        description: "Play one of DIAL's six saved radio presets.",
        inputSchema: {
          type: "object",
          properties: {
            preset: {
              type: "integer",
              minimum: 1,
              maximum: 6,
              description: "Preset number from 1 to 6."
            }
          },
          required: ["preset"]
        },
        execute: async ({ preset }) => toolText(await playPreset(preset))
      },
      {
        name: "save_current_to_preset",
        description: "Save the station DIAL is currently tuned to into one of the six preset slots.",
        inputSchema: {
          type: "object",
          properties: {
            preset: {
              type: "integer",
              minimum: 1,
              maximum: 6,
              description: "Preset number from 1 to 6."
            }
          },
          required: ["preset"]
        },
        execute: async ({ preset }) => toolText(savePreset(preset))
      },
      {
        name: "go_back_station",
        description: "Return DIAL to the station that was tuned immediately before the current station.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => toolText(await goBack())
      }
    ];

    for (const tool of tools) {
      try {
        await modelContext.registerTool(tool);
      } catch (error) {
        console.warn(`DIAL WebMCP tool registration failed: ${tool.name}`, error);
      }
    }
  }

  playButton.addEventListener("click", togglePlayback);
  previousButton.addEventListener("click", () => tune("previous"));
  nextButton.addEventListener("click", () => tune("next"));
  backButton.addEventListener("click", goBack);
  shufflePresetsButton.addEventListener("click", shufflePresets);
  shuffleAllButton.addEventListener("click", shuffleAll);

  savePresetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    savePreset(presetNumber.value);
  });

  audio.addEventListener("playing", updateUI);
  audio.addEventListener("pause", updateUI);
  audio.addEventListener("waiting", updateUI);
  audio.addEventListener("error", () => {
    shouldBePlaying = false;
    updateUI();
    announce(`${currentStation().name} is unavailable right now. Try another station.`);
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isEditable =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;
    const isInteractive =
      target instanceof Element &&
      Boolean(target.closest("button, a, summary"));

    if (isEditable || isInteractive) return;

    if (event.code === "Space") {
      event.preventDefault();
      togglePlayback();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      tune("previous");
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      tune("next");
      return;
    }

    if (/^Digit[1-6]$/.test(event.code)) {
      event.preventDefault();
      const preset = event.code.slice(-1);
      if (event.shiftKey) savePreset(preset);
      else playPreset(preset);
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "s") {
      event.preventDefault();
      shufflePresets();
    } else if (key === "a") {
      event.preventDefault();
      shuffleAll();
    } else if (key === "b") {
      event.preventDefault();
      goBack();
    } else if (key === "i") {
      event.preventDefault();
      describeCurrentStation();
    }
  });

  audio.src = currentStation().stream;
  updateUI();
  registerWebMCPTools();
})();