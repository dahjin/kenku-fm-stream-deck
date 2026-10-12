function applySettings(settings) {
  applyLibrary(currentLibrary || { playlists: [], tracks: [] }, settings);
}

function applyLibrary(library, settings) {
  replaceOptions(
    document.getElementById("id"),
    [
      { label: "Playlists", items: library.playlists || [] },
      { label: "Tracks", items: library.tracks || [] },
    ],
    settings.id,
  );
}

function getSettings() {
  return { id: document.getElementById("id").value };
}
