(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) {
    root.DialBrowse = api;
    if (root.document) {
      const start = () => api.init(root);
      if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
      else start();
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const START_STORAGE_KEY = "dial.start.v1";
  const RECENT_STORAGE_KEY = "dial.discovery.recents.v1";
  const RECENT_LIMIT = 6;
  const SEARCH_KINDS = new Set(["name", "tag", "country", "language"]);

  const CONTINENTS = Object.freeze({
    Europe: ["GB", "IE", "FR", "DE", "ES", "IT", "NL", "BE", "CH", "AT", "PL", "PT", "SE", "NO", "FI", "DK", "CZ", "GR", "RO", "HU", "UA"],
    Africa: ["ZA", "NG", "KE", "GH", "EG", "MA", "TN", "DZ", "SN", "CI", "UG", "TZ", "ET", "AO", "MZ", "BW", "ZW"],
    Asia: ["JP", "KR", "IN", "CN", "TW", "HK", "SG", "MY", "ID", "TH", "VN", "PH", "PK", "BD", "LK", "NP", "IL", "AE", "SA"],
    "North America": ["US", "CA", "MX", "CR", "PA", "JM", "TT", "DO", "GT", "HN", "SV", "NI", "BS", "BB"],
    "South America": ["BR", "AR", "CL", "CO", "PE", "UY", "PY", "BO", "EC", "VE", "GY", "SR"],
    Oceania: ["AU", "NZ", "FJ", "PG", "WS", "TO", "VU", "SB", "NC", "PF"]
  });

  const COUNTRY_CHOICES = Object.freeze(["United Kingdom", "United States", "Germany", "France", "Canada", "Netherlands", "Australia", "Ireland", "Spain", "Italy", "Japan", "Brazil"]);
  const LANGUAGE_CHOICES = Object.freeze(["English", "French", "German", "Spanish", "Italian", "Dutch", "Portuguese", "Japanese"]);
  const MUSIC_CHOICES = Object.freeze(["Rock", "Electronic", "Jazz", "Classical", "Pop", "Ambient", "Soul", "Reggae"]);
  const TALK_CHOICES = Object.freeze(["News", "Talk", "Public radio"]);

  function normalizeRecent(values) {
    if (!Array.isArray(values)) return [];
    const seen = new Set();
    const result = [];
    for (const value of values) {
      const kind = String(value?.kind || "").trim();
      const query = String(value?.query || "").trim();
      if (!SEARCH_KINDS.has(kind) || query.length < 2) continue;
      const key = `${kind}\u0000${query.toLocaleLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ kind, query });
      if (result.length >= RECENT_LIMIT) break;
    }
    return result;
  }

  function addRecentChoice(values, choice) {
    const normalized = normalizeRecent(values);
    const kind = String(choice?.kind || "").trim();
    const query = String(choice?.query || "").trim();
    if (!SEARCH_KINDS.has(kind) || query.length < 2) return normalized;
    return normalizeRecent([{ kind, query }, ...normalized]);
  }

  function inferRegion(locale) {
    try {
      return new Intl.Locale(String(locale || "")).region || "";
    } catch {
      const match = String(locale || "").match(/[-_]([A-Za-z]{2})$/);
      return match ? match[1].toUpperCase() : "";
    }
  }

  function countryName(region, locale = "en") {
    const code = String(region || "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) return "";
    try {
      return new Intl.DisplayNames([locale || "en"], { type: "region" }).of(code) || code;
    } catch {
      return code;
    }
  }

  function chooseContinentCountry(continent, random = Math.random) {
    const countries = CONTINENTS[continent];
    if (!countries?.length) return "";
    const value = Number(random());
    const safe = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999999999) : 0;
    return countries[Math.floor(safe * countries.length)];
  }

  function init(root) {
    const document = root.document;
    const discoveryForm = document.getElementById("discovery-form");
    const discoveryQuery = document.getElementById("discovery-query");
    const discoveryKind = document.getElementById("discovery-kind");
    const startPanel = document.getElementById("start-panel");
    if (!discoveryForm || !discoveryQuery || !discoveryKind || !startPanel) return;

    const recentChoices = document.getElementById("recent-choices");
    const recentEmpty = document.getElementById("recent-empty");
    const countryPanel = document.getElementById("country-panel");
    const countryChoices = document.getElementById("country-choices");
    const languagePanel = document.getElementById("language-panel");
    const languageChoices = document.getElementById("language-choices");
    const genreChoices = document.getElementById("genre-choices");
    const talkChoices = document.getElementById("talk-choices");
    const continentChoices = document.getElementById("continent-choices");
    const continentPanel = document.getElementById("continent-panel");
    const continentHeading = document.getElementById("continent-heading");
    const continentCountryChoices = document.getElementById("continent-country-choices");
    const continentStartButton = document.getElementById("continent-start-button");
    const startCountryButton = document.getElementById("start-country");
    const choicePanels = [countryPanel, languagePanel, genreChoices, talkChoices, continentChoices, continentPanel].filter(Boolean);
    const primaryChoiceButtons = {
      country: document.getElementById("browse-country"),
      tag: document.getElementById("browse-genre"),
      language: document.getElementById("browse-language"),
      name: document.querySelector('[data-search-kind="name"]')
    };
    const primaryChoiceLabels = {
      country: "Country",
      tag: "Genre",
      language: "Language",
      name: "Station name"
    };
    const activeFilters = {};
    let selectedContinent = "";
    let recents = loadRecents();

    for (const button of Object.values(primaryChoiceButtons)) {
      if (button) button.setAttribute("aria-pressed", "false");
    }
    syncActiveFilters();

    function readStorage(key) {
      try { return root.localStorage.getItem(key); } catch { return null; }
    }

    function writeStorage(key, value) {
      try { root.localStorage.setItem(key, value); } catch {}
    }

    function loadRecents() {
      try {
        return normalizeRecent(JSON.parse(root.localStorage.getItem(RECENT_STORAGE_KEY) || "[]"));
      } catch {
        return [];
      }
    }

    function saveRecents() {
      writeStorage(RECENT_STORAGE_KEY, JSON.stringify(recents));
    }

    function rememberStart(choice) {
      writeStorage(START_STORAGE_KEY, JSON.stringify({ choice, savedAt: Date.now() }));
    }

    function hideStart() {
      startPanel.hidden = true;
    }

    function showStart() {
      hideChoicePanels();
      startPanel.hidden = false;
      document.getElementById("start-heading")?.focus();
    }

    function hideChoicePanels(except = null) {
      for (const panel of choicePanels) {
        if (panel !== except) panel.hidden = true;
      }
      if (except !== continentPanel) selectedContinent = "";
    }

    function syncActiveFilters() {
      root.DialBrowseActiveFilters = { ...activeFilters };
    }

    function renderActiveChoices() {
      for (const [kind, button] of Object.entries(primaryChoiceButtons)) {
        if (!button) continue;
        const label = primaryChoiceLabels[kind];
        const term = activeFilters[kind];
        if (term) {
          button.textContent = `${label}: ${term}`;
          button.setAttribute("aria-pressed", "true");
          button.setAttribute("aria-label", `Selected ${label}: ${term}`);
          button.title = `Selected ${label}: ${term}`;
          button.classList.add("selected-choice");
        } else {
          button.textContent = label;
          button.setAttribute("aria-pressed", "false");
          button.classList.remove("selected-choice");
          button.removeAttribute("aria-label");
          button.removeAttribute("title");
        }
      }
    }

    function clearActiveChoice(kind = null) {
      if (kind && SEARCH_KINDS.has(kind)) delete activeFilters[kind];
      else {
        for (const key of Object.keys(activeFilters)) delete activeFilters[key];
      }
      syncActiveFilters();
      renderActiveChoices();
    }

    function setActiveChoice(kind, query) {
      const term = String(query || "").trim();
      if (!SEARCH_KINDS.has(kind) || !term) return;
      activeFilters[kind] = term;
      syncActiveFilters();
      renderActiveChoices();
    }

    function focusSearch(kind) {
      hideChoicePanels();
      discoveryKind.value = SEARCH_KINDS.has(kind) ? kind : "name";
      discoveryQuery.focus();
    }

    function submitSearch(kind, query) {
      const safeKind = SEARCH_KINDS.has(kind) ? kind : "name";
      const term = String(query || "").trim();
      if (term.length < 2) return;
      hideChoicePanels();
      discoveryKind.value = safeKind;
      discoveryQuery.value = term;
      setActiveChoice(safeKind, term);
      recents = addRecentChoice(recents, { kind: safeKind, query: term });
      saveRecents();
      renderRecents();
      discoveryForm.requestSubmit();
    }

    function renderButtons(container, values, onClick) {
      if (!container) return;
      container.replaceChildren();
      for (const value of values) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = value;
        button.addEventListener("click", () => onClick(value));
        container.appendChild(button);
      }
    }

    function renderRecents() {
      if (!recentChoices) return;
      recentChoices.replaceChildren();
      if (recentEmpty) recentEmpty.hidden = recents.length > 0;
      for (const choice of recents) {
        const button = document.createElement("button");
        button.type = "button";
        const label = choice.kind === "tag" ? "Genre" : choice.kind[0].toUpperCase() + choice.kind.slice(1);
        button.textContent = `${label}: ${choice.query}`;
        button.addEventListener("click", () => submitSearch(choice.kind, choice.query));
        recentChoices.appendChild(button);
      }
    }

    function revealChoicePanel(panel) {
      if (!panel) return;
      hideChoicePanels(panel);
      panel.hidden = false;
      panel.querySelector("button")?.focus();
    }

    function openContinent(continent) {
      selectedContinent = continent;
      const codes = CONTINENTS[continent] || [];
      if (!continentPanel || !continentCountryChoices || !continentHeading || !continentStartButton) return;
      hideChoicePanels(continentPanel);
      selectedContinent = continent;
      continentHeading.textContent = continent;
      continentPanel.hidden = false;
      continentCountryChoices.replaceChildren();
      for (const code of codes) {
        const name = countryName(code);
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = name;
        button.addEventListener("click", () => submitSearch("country", name));
        continentCountryChoices.appendChild(button);
      }
      continentStartButton.textContent = `Start somewhere in ${continent}`;
      continentStartButton.focus();
    }

    renderButtons(countryChoices, COUNTRY_CHOICES, (country) => submitSearch("country", country));
    renderButtons(languageChoices, LANGUAGE_CHOICES, (language) => submitSearch("language", language));
    renderButtons(genreChoices, MUSIC_CHOICES, (genre) => submitSearch("tag", genre));
    renderButtons(talkChoices, TALK_CHOICES, (tag) => submitSearch("tag", tag));
    renderButtons(continentChoices, Object.keys(CONTINENTS), openContinent);
    renderRecents();
    renderActiveChoices();

    for (const button of document.querySelectorAll("[data-search-kind]")) {
      button.addEventListener("click", () => focusSearch(button.dataset.searchKind));
    }

    document.getElementById("browse-country")?.addEventListener("click", () => revealChoicePanel(countryPanel));
    document.getElementById("browse-language")?.addEventListener("click", () => revealChoicePanel(languagePanel));
    document.getElementById("browse-genre")?.addEventListener("click", () => revealChoicePanel(genreChoices));
    document.getElementById("browse-continent")?.addEventListener("click", () => revealChoicePanel(continentChoices));
    document.getElementById("country-other")?.addEventListener("click", () => focusSearch("country"));
    document.getElementById("language-other")?.addEventListener("click", () => focusSearch("language"));
    document.getElementById("show-start-button")?.addEventListener("click", showStart);
    document.getElementById("clear-search-button")?.addEventListener("click", () => clearActiveChoice());

    document.getElementById("start-music")?.addEventListener("click", () => {
      rememberStart("music");
      hideStart();
      revealChoicePanel(genreChoices);
    });
    document.getElementById("start-news")?.addEventListener("click", () => {
      rememberStart("news-talk");
      hideStart();
      revealChoicePanel(talkChoices);
    });
    document.getElementById("start-world")?.addEventListener("click", () => {
      rememberStart("world");
      hideStart();
      revealChoicePanel(continentChoices);
    });
    document.getElementById("start-surprise")?.addEventListener("click", () => {
      rememberStart("surprise");
      hideStart();
      const continentNames = Object.keys(CONTINENTS);
      const continent = continentNames[Math.floor(Math.random() * continentNames.length)];
      const code = chooseContinentCountry(continent);
      submitSearch("country", countryName(code));
    });
    document.getElementById("start-skip")?.addEventListener("click", () => {
      rememberStart("skip");
      hideStart();
      hideChoicePanels();
      document.getElementById("now-heading")?.focus();
    });

    const region = inferRegion(root.navigator?.language || "");
    if (startCountryButton) {
      if (region) {
        const name = countryName(region);
        startCountryButton.textContent = `My country: ${name}`;
        startCountryButton.addEventListener("click", () => {
          rememberStart("country");
          hideStart();
          submitSearch("country", name);
        });
      } else {
        startCountryButton.textContent = "Choose my country";
        startCountryButton.addEventListener("click", () => {
          rememberStart("country");
          hideStart();
          focusSearch("country");
        });
      }
    }

    continentStartButton?.addEventListener("click", () => {
      if (!selectedContinent) return;
      const code = chooseContinentCountry(selectedContinent);
      submitSearch("country", countryName(code));
    });

    discoveryForm.addEventListener("submit", () => {
      const term = String(discoveryQuery.value || "").trim();
      const kind = String(discoveryKind.value || "name");
      if (term.length < 2 || !SEARCH_KINDS.has(kind)) return;
      hideChoicePanels();
      setActiveChoice(kind, term);
      recents = addRecentChoice(recents, { kind, query: term });
      saveRecents();
      renderRecents();
    });

    if (!readStorage(START_STORAGE_KEY)) startPanel.hidden = false;
  }

  return {
    START_STORAGE_KEY,
    RECENT_STORAGE_KEY,
    RECENT_LIMIT,
    CONTINENTS,
    COUNTRY_CHOICES,
    LANGUAGE_CHOICES,
    MUSIC_CHOICES,
    TALK_CHOICES,
    normalizeRecent,
    addRecentChoice,
    inferRegion,
    countryName,
    chooseContinentCountry,
    init
  };
});
