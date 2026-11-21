// VELMARA — Isles of the Falling Sea.
// A travel poster for a place that does not exist.
// The poster artwork is produced at build time and shipped with this
// program as a bundled asset; the program runs fully offline and
// deterministically emits it as /output/entry.png.
import { copyFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576;
const OUT_PATH = "/output/entry.png";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const assetPath = join(repoRoot, "assets", "poster.jpg");

mkdirSync("/output", { recursive: true });
copyFileSync(assetPath, OUT_PATH);

const size = statSync(OUT_PATH).size;
if (size > MAX_BYTES) {
  throw new Error(`entry.png is ${size} bytes, over the ${MAX_BYTES} byte cap`);
}
console.log(`wrote ${OUT_PATH} (${size} bytes)`);
