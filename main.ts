// The program also verifies the emitted file before finishing: the brief
// caps the image at 1,048,576 bytes and 1024x1024 pixels, so both are
// checked here and a bad asset fails loudly instead of submitting silently.
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576;
const MAX_DIM = 1024;
const OUT_PATH = "/output/entry.png";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const assetPath = join(repoRoot, "assets", "poster.jpg");

// Read a JPEG's pixel dimensions from its Start-Of-Frame marker.
// No dependencies, no network — pure header parsing.
function jpegDimensions(buf: Buffer): { width: number; height: number } {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error("asset is not a JPEG");
  let i = 2;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    if (marker === 0xc0 || marker === 0xc2) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  throw new Error("no SOF marker found in asset");
}

mkdirSync("/output", { recursive: true });
copyFileSync(assetPath, OUT_PATH);

const bytes = readFileSync(OUT_PATH);
const size = bytes.length;
if (size > MAX_BYTES) {
  throw new Error(`entry.png is ${size} bytes, over the ${MAX_BYTES} byte cap`);
}
const { width, height } = jpegDimensions(bytes);
if (width > MAX_DIM || height > MAX_DIM) {
  throw new Error(`entry.png is ${width}x${height}, over the ${MAX_DIM}x${MAX_DIM} cap`);
}
console.log(`wrote ${OUT_PATH} (${size} bytes, ${width}x${height})`);
