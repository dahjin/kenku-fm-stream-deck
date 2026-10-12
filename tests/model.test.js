const test = require("node:test");
const assert = require("node:assert/strict");
const {
  emptyLibrary,
  playlistPlayRequest,
  soundPlayRequest,
  togglePlaylistTag,
  clampVolume,
} = require("../plugin/model.js");

const library = {
  ...emptyLibrary(),
  playlists: [
    {
      id: "tavern/list",
      title: "Tavern",
      availableTags: ["creepy", "tavern"],
      tagFilter: ["creepy"],
    },
  ],
  tracks: [{ id: "track 1", title: "Uneasy Inn" }],
  sounds: [{ id: "hammer/1", title: "Hammer" }],
  soundboards: [{ id: "forge/1", title: "Forge" }],
};

test("selects version 2 playlist and track routes by stable ID", () => {
  assert.deepEqual(playlistPlayRequest(library, "tavern/list"), {
    path: "playlists/tavern%2Flist/play",
    method: "PUT",
  });
  assert.deepEqual(playlistPlayRequest(library, "track 1"), {
    path: "tracks/track%201/play",
    method: "PUT",
  });
  assert.equal(playlistPlayRequest(library, "missing"), undefined);
});

test("sound buttons switch between version 2 play and stop routes", () => {
  assert.deepEqual(soundPlayRequest(library, "hammer/1", false), {
    path: "sounds/hammer%2F1/play",
    method: "PUT",
    toggle: true,
  });
  assert.deepEqual(soundPlayRequest(library, "hammer/1", true), {
    path: "sounds/hammer%2F1/playback",
    method: "DELETE",
    toggle: true,
  });
  assert.deepEqual(soundPlayRequest(library, "forge/1", false), {
    path: "soundboards/forge%2F1/play",
    method: "PUT",
    toggle: false,
  });
  assert.equal(soundPlayRequest(library, "missing", false), undefined);
});

test("tag buttons toggle normalized tags while preserving other filters", () => {
  assert.deepEqual(togglePlaylistTag(library, "tavern/list", "CREEPY"), []);
  assert.deepEqual(togglePlaylistTag(library, "tavern/list", "tavern"), [
    "creepy",
    "tavern",
  ]);
  assert.equal(
    togglePlaylistTag(library, "tavern/list", "peaceful"),
    undefined,
  );
});

test("volume steps remain in the API's accepted range", () => {
  assert.equal(clampVolume(1.05), 1);
  assert.equal(clampVolume(-0.05), 0);
  assert.equal(clampVolume(0.30000000000000004), 0.3);
});
