import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(join(root, "manifest.json"), "utf8"),
);
const packageJson = JSON.parse(
  await readFile(join(root, "package.json"), "utf8"),
);

if (manifest.Version !== packageJson.version) {
  throw new Error(
    `Version mismatch: manifest.json is ${manifest.Version}, package.json is ${packageJson.version}`,
  );
}

const tag = process.argv[2];

if (tag && tag !== `v${manifest.Version}`) {
  throw new Error(
    `Release tag ${tag} does not match plugin version v${manifest.Version}`,
  );
}

console.log(
  `Version ${manifest.Version} is consistent${tag ? ` with ${tag}` : ""}.`,
);
