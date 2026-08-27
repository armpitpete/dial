(() => {
  "use strict";

  const PANEL_IDS = [
    "country-panel",
    "genre-choices",
    "language-panel",
    "talk-choices",
    "continent-choices",
    "continent-panel"
  ];

  function hideBrowsePanels(documentRef = document) {
    for (const id of PANEL_IDS) {
      const panel = documentRef.getElementById(id);
      if (panel) panel.hidden = true;
    }
  }

  function init(documentRef = document) {
    const discovery = documentRef.querySelector(".discovery");
    if (!discovery) return;

    discovery.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || !discovery.contains(button)) return;

      if (
        button.id === "browse-country" ||
        button.id === "browse-genre" ||
        button.id === "browse-language" ||
        button.id === "browse-continent" ||
        button.id === "show-start-button" ||
        button.closest(".choice-panel") ||
        button.closest(".continent-panel")
      ) {
        hideBrowsePanels(documentRef);
      }
    }, true);
  }

  window.DialBrowseProgressive = { PANEL_IDS, hideBrowsePanels, init };
  init();
})();
