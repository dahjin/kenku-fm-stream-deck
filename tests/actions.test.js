const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function harness() {
  const requests = [];
  const alerts = [];
  const context = vm.createContext({
    console,
    setImageFromURL: () => undefined,
    setTitle: () => undefined,
    showAlert: (id) => alerts.push(id),
    api: async (...args) => {
      requests.push(args);
      return { ok: true };
    },
  });
  vm.runInContext(
    fs.readFileSync(path.join(root, "plugin/model.js"), "utf8"),
    context,
  );
  vm.runInContext(
    `
      let remoteApiVersion = 2;
      let remoteLibrary = {
        playlists: [{ id: "playlist-1", title: "Tavern", availableTags: ["creepy", "tavern"], tagFilter: [] }],
        tracks: [{ id: "track-1", title: "Uneasy Inn" }],
        soundboards: [{ id: "board-1", title: "Forge", groups: [{ id: "group-1", title: "Blacksmith" }] }],
        sounds: [{ id: "sound-1", title: "Hammer" }],
        scenes: [{ id: "scene-1", title: "Razor Bay", tabs: [{ id: "tab-1", title: "Night" }] }]
      };
      const playbackState = {
        playlist: { playing: false, repeat: "off", shuffle: false, muted: false, volume: 1 },
        soundboard: { sounds: [], groups: [] },
        scene: null
      };
    `,
    context,
  );
  vm.runInContext(
    `${fs.readFileSync(path.join(root, "plugin/actions.js"), "utf8")}
     globalThis.testActions = actions;`,
    context,
  );
  return { actions: context.testActions, requests, alerts };
}

test("every manifest action has a plugin handler", () => {
  const { actions } = harness();
  const manifest = require("../manifest.json");
  assert.deepEqual(
    Object.keys(actions).sort(),
    manifest.Actions.map((action) => action.UUID).sort(),
  );
});

test("playlist and scene buttons use their version 2 routes", async () => {
  const { actions, requests, alerts } = harness();
  await actions["fm.kenku.remote.playlist-play"].onKeyDown("playlist", {
    id: "track-1",
  });
  await actions["fm.kenku.remote.scene"].onKeyDown("scene", {
    sceneId: "scene-1",
    tabId: "tab-1",
  });
  assert.deepEqual(JSON.parse(JSON.stringify(requests)), [
    ["tracks/track-1/play", "PUT"],
    ["scenes/scene-1/tabs/tab-1/activate", "PUT"],
  ]);
  assert.deepEqual(alerts, []);
});

test("tag and group buttons issue validated toggle requests", async () => {
  const { actions, requests, alerts } = harness();
  await actions["fm.kenku.remote.playlist-tag"].onKeyDown("tag", {
    playlistId: "playlist-1",
    tag: "creepy",
  });
  actions["fm.kenku.remote.sound-group"].onWillAppear("group", {
    id: "group-1",
  });
  await actions["fm.kenku.remote.sound-group"].onKeyDown("group", {
    id: "group-1",
  });
  assert.deepEqual(JSON.parse(JSON.stringify(requests)), [
    ["playlists/playlist-1/tags", "PUT", { tags: ["creepy"] }],
    ["groups/group-1/play", "PUT"],
  ]);
  assert.deepEqual(alerts, []);
});

test("playlist stop maps to the new DELETE endpoint", async () => {
  const { actions, requests } = harness();
  await actions["fm.kenku.remote.playlist-playback"].onKeyDown("stop", {
    action: "stop",
  });
  assert.deepEqual(requests, [["playback", "DELETE"]]);
});

test("whole soundboards use the version 2 random-play route", async () => {
  const { actions, requests, alerts } = harness();
  const action = actions["fm.kenku.remote.soundboard-play"];
  action.onWillAppear("board", { id: "board-1" });
  await action.onKeyDown("board", { id: "board-1" });
  assert.deepEqual(requests, [["soundboards/board-1/play", "PUT"]]);
  assert.deepEqual(alerts, []);
});
