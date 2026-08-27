(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.DialPresentation = api;
  if (root?.document) api.install(root.document);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const LONG_NAME_THRESHOLD = 80;

  function detailsOnly(name, summary) {
    const stationName = String(name || "").trim();
    const text = String(summary || "").trim();
    if (!stationName || !text) return text;
    if (text === `${stationName}.`) return "";
    const prefix = `${stationName}. `;
    return text.startsWith(prefix) ? text.slice(prefix.length) : text;
  }

  function syncName(element) {
    if (!element) return;
    const name = element.textContent.trim();
    element.classList.toggle("long-station-name", name.length > LONG_NAME_THRESHOLD);
    if (name) element.title = name;
    else element.removeAttribute("title");
  }

  function syncPair(documentRef, nameId, descriptionId) {
    const nameElement = documentRef.getElementById(nameId);
    const descriptionElement = documentRef.getElementById(descriptionId);
    syncName(nameElement);
    if (!nameElement || !descriptionElement) return;
    const next = detailsOnly(nameElement.textContent, descriptionElement.textContent);
    if (next !== descriptionElement.textContent.trim()) descriptionElement.textContent = next;
  }

  function syncPresets(documentRef) {
    const container = documentRef.getElementById("preset-buttons");
    if (!container) return;
    for (const button of container.querySelectorAll("button")) {
      const text = button.textContent.trim();
      button.classList.toggle("long-preset-name", text.length > LONG_NAME_THRESHOLD);
      if (text) button.title = text;
      else button.removeAttribute("title");
    }
  }

  function install(documentRef) {
    if (!documentRef) return null;
    const watchedIds = [
      "station-name",
      "discovery-name",
      "discovery-description",
      "library-name",
      "library-description",
      "preset-buttons"
    ];

    const sync = () => {
      syncName(documentRef.getElementById("station-name"));
      syncPair(documentRef, "discovery-name", "discovery-description");
      syncPair(documentRef, "library-name", "library-description");
      syncPresets(documentRef);
    };

    sync();
    if (typeof MutationObserver !== "function") return null;
    const observer = new MutationObserver(sync);
    for (const id of watchedIds) {
      const element = documentRef.getElementById(id);
      if (element) observer.observe(element, { childList: true, characterData: true, subtree: true });
    }
    return observer;
  }

  return { LONG_NAME_THRESHOLD, detailsOnly, install };
});
