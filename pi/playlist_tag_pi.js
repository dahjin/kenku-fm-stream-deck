function applySettings(settings) {
  applyLibrary(currentLibrary || { playlists: [] }, settings);
}

function applyLibrary(library, settings) {
  replaceOptions(
    document.getElementById("playlist"),
    [{ label: "Playlists", items: library.playlists || [] }],
    settings.playlistId,
  );
  populateTags(settings.tag);
}

function populateTags(selected) {
  const playlistId = document.getElementById("playlist").value;
  const playlist = currentLibrary?.playlists?.find(
    (item) => item.id === playlistId,
  );
  const tags = (playlist?.availableTags || []).map((tag) => ({
    id: tag,
    title: `#${tag}`,
  }));
  replaceOptions(
    document.getElementById("tag"),
    [{ label: "Tags", items: tags }],
    selected,
  );
}

function playlistChanged() {
  populateTags("");
  sendSettings();
}

function getSettings() {
  return {
    playlistId: document.getElementById("playlist").value,
    tag: document.getElementById("tag").value,
  };
}
