function applySettings(settings) {
  document.getElementById("playbackSelect").value =
    settings.action || "play-pause";
}

function applyLibrary() {}

function getSettings() {
  return { action: document.getElementById("playbackSelect").value };
}
