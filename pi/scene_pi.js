function applySettings(settings) {
  applyLibrary(currentLibrary || { scenes: [] }, settings);
}

function applyLibrary(library, settings) {
  replaceOptions(
    document.getElementById("scene"),
    [{ label: "Scenes", items: library.scenes || [] }],
    settings.sceneId,
  );
  populateTabs(settings.tabId);
}

function populateTabs(selected) {
  const sceneId = document.getElementById("scene").value;
  const scene = currentLibrary?.scenes?.find((item) => item.id === sceneId);
  replaceOptions(
    document.getElementById("tab"),
    [{ label: "Scene tabs", items: scene?.tabs || [] }],
    selected,
  );
}

function sceneChanged() {
  populateTabs("");
  sendSettings();
}

function getSettings() {
  return {
    sceneId: document.getElementById("scene").value,
    tabId: document.getElementById("tab").value,
  };
}
