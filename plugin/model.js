(function (root, factory) {
  const model = factory();
  Object.assign(root, model);
  if (typeof module !== "undefined") module.exports = model;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function emptyLibrary() {
    return {
      playlists: [],
      tracks: [],
      soundboards: [],
      sounds: [],
      scenes: [],
    };
  }

  function playlistPlayRequest(library, id) {
    if (library.playlists.some((item) => item.id === id))
      return {
        path: `playlists/${encodeURIComponent(id)}/play`,
        method: "PUT",
      };
    if (library.tracks.some((item) => item.id === id))
      return { path: `tracks/${encodeURIComponent(id)}/play`, method: "PUT" };
  }

  function soundPlayRequest(library, id, playing) {
    if (library.sounds.some((item) => item.id === id))
      return playing
        ? {
            path: `sounds/${encodeURIComponent(id)}/playback`,
            method: "DELETE",
            toggle: true,
          }
        : {
            path: `sounds/${encodeURIComponent(id)}/play`,
            method: "PUT",
            toggle: true,
          };
    if (library.soundboards.some((item) => item.id === id))
      return {
        path: `soundboards/${encodeURIComponent(id)}/play`,
        method: "PUT",
        toggle: false,
      };
  }

  function togglePlaylistTag(library, playlistId, tag) {
    const playlist = library.playlists.find((item) => item.id === playlistId);
    if (!playlist) return undefined;
    const normalized = String(tag || "")
      .trim()
      .toLowerCase();
    if (!normalized || !playlist.availableTags.includes(normalized))
      return undefined;
    const selected = (playlist.tagFilter || []).map((item) =>
      item.toLowerCase(),
    );
    return selected.includes(normalized)
      ? selected.filter((item) => item !== normalized)
      : [...selected, normalized];
  }

  function clampVolume(value) {
    return Math.max(0, Math.min(1, Math.round(value * 100) / 100));
  }

  return {
    emptyLibrary,
    playlistPlayRequest,
    soundPlayRequest,
    togglePlaylistTag,
    clampVolume,
  };
});
