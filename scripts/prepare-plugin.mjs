import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const buildRoot = join(root, "build");
const pluginRoot = join(buildRoot, "fm.kenku.remote.sdPlugin");
const runtimeEntries = [
  "assets",
  "pi",
  "plugin",
  "en.json",
  "manifest.json",
  "LICENSE",
];

await rm(buildRoot, { force: true, recursive: true });
await mkdir(pluginRoot, { recursive: true });

for (const entry of runtimeEntries) {
  await cp(join(root, entry), join(pluginRoot, entry), { recursive: true });
}

console.log(`Prepared ${pluginRoot}`);
