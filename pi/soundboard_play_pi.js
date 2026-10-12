function applySettings(settings) {
  applyLibrary(currentLibrary || { sounds: [], soundboards: [] }, settings);
}

function applyLibrary(library, settings) {
  replaceOptions(
    document.getElementById("id"),
    [
      { label: "Sounds", items: library.sounds || [] },
      {
        label: "Soundboards (random play)",
        items: library.soundboards || [],
      },
    ],
    settings.id,
  );
}

function getSettings() {
  return { id: document.getElementById("id").value };
}
