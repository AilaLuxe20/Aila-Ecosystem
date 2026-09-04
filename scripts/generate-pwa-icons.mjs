import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "public", "brand", "aila-logo.jpg");
const outDir = path.join(root, "public", "icons");

fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(source)) {
  console.error("Missing source logo at", source);
  process.exit(1);
}

async function square(size, file, { maskable = false } = {}) {
  const padRatio = maskable ? 0.12 : 0;
  const inner = Math.round(size * (1 - padRatio * 2));
  const logo = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: { r: 3, g: 3, b: 3, alpha: 1 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 3, g: 3, b: 3 },
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(path.join(outDir, file));
}

/** Crop to the celestial A mark (upper portion) for small favicon-scale icons. */
async function markCrop(size, file) {
  const meta = await sharp(source).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;
  // Keep the orbital A; drop most of the wordmark for legibility at small sizes
  const top = Math.round(h * 0.02);
  const cropH = Math.round(h * 0.62);
  const left = Math.round(w * 0.08);
  const cropW = Math.round(w * 0.84);

  await sharp(source)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(size, size, { fit: "contain", background: { r: 3, g: 3, b: 3, alpha: 1 } })
    .extend({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: { r: 3, g: 3, b: 3, alpha: 1 },
    })
    .png()
    .toFile(path.join(outDir, file));
}

await square(512, "icon-512.png");
await square(512, "icon-512-maskable.png", { maskable: true });
await square(192, "icon-192.png");
await square(180, "apple-touch-icon.png");
await markCrop(96, "icon-96.png");
await markCrop(32, "icon-32.png");

// Keep a high-res brand asset for splash / OG reuse
await sharp(source)
  .resize(1024, 1024, { fit: "contain", background: { r: 3, g: 3, b: 3, alpha: 1 } })
  .png()
  .toFile(path.join(outDir, "icon-1024.png"));

console.log(
  "icons from official Aila logo:",
  fs.readdirSync(outDir).map((name) => `${name} (${fs.statSync(path.join(outDir, name)).size}b)`),
);
