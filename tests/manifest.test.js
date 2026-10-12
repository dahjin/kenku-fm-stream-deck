const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "manifest.json"), "utf8"),
);

test("manifest action IDs and property inspectors are complete", () => {
  const ids = manifest.Actions.map((action) => action.UUID);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids.slice(-3), [
    "fm.kenku.remote.scene",
    "fm.kenku.remote.playlist-tag",
    "fm.kenku.remote.sound-group",
  ]);
  for (const action of manifest.Actions) {
    assert.equal(
      fs.existsSync(path.join(root, action.PropertyInspectorPath)),
      true,
      action.PropertyInspectorPath,
    );
    for (const base of [
      action.Icon,
      ...action.States.map((state) => state.Image),
    ]) {
      assert.equal(
        [".png", ".jpg"].some((extension) =>
          fs.existsSync(path.join(root, base + extension)),
        ),
        true,
        base,
      );
    }
  }
});

test("HTML entry points only reference files shipped by the plugin", () => {
  const htmlFiles = [
    manifest.CodePath,
    ...manifest.Actions.map((action) => action.PropertyInspectorPath),
  ];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    const directory = path.dirname(path.join(root, file));
    const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(
      (match) => match[1],
    );
    for (const reference of references)
      assert.equal(
        fs.existsSync(path.resolve(directory, reference)),
        true,
        `${file}: ${reference}`,
      );
  }
});

test("plugin and package versions stay aligned", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json")));
  assert.equal(manifest.Version, pkg.version);
});
