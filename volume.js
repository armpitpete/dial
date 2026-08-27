(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) {
    root.DialVolume = api;
    if (root.document) {
      const start = () => api.init(root);
      if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
      else start();
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VOLUME_STORAGE_KEY = "dial.volume.v1";
  const DEFAULT_VOLUME = 100;

  function normalizeVolume(value, fallback = DEFAULT_VOLUME) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.round(Math.min(Math.max(number, 0), 100));
  }

  function init(root) {
    const document = root.document;
    const audio = document.getElementById("audio");
    const slider = document.getElementById("volume-slider");
    const output = document.getElementById("volume-value");
    const status = document.getElementById("status");
    if (!audio || !slider || !output) return;

    function readStoredVolume() {
      try {
        const stored = root.localStorage.getItem(VOLUME_STORAGE_KEY);
        return stored === null ? DEFAULT_VOLUME : normalizeVolume(stored);
      } catch {
        return DEFAULT_VOLUME;
      }
    }

    function persistVolume(value) {
      try { root.localStorage.setItem(VOLUME_STORAGE_KEY, String(value)); } catch {}
    }

    function applyVolume(value, { persist = true } = {}) {
      const percent = normalizeVolume(value);
      audio.volume = percent / 100;
      slider.value = String(percent);
      slider.setAttribute("aria-valuetext", percent === 0 ? "Muted" : `${percent} percent`);
      output.textContent = `${percent}%`;
      if (persist) persistVolume(percent);
      return percent;
    }

    function announceVolume() {
      if (!status) return;
      const percent = normalizeVolume(slider.value);
      status.textContent = "";
      root.setTimeout(() => {
        status.textContent = percent === 0 ? "Volume muted." : `Volume ${percent} percent.`;
      }, 20);
    }

    applyVolume(readStoredVolume(), { persist: false });
    slider.addEventListener("input", () => applyVolume(slider.value));
    slider.addEventListener("change", announceVolume);
  }

  return { VOLUME_STORAGE_KEY, DEFAULT_VOLUME, normalizeVolume, init };
});
