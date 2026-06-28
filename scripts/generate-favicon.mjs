import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BRAND = "#FF5C00";

const compassIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="${BRAND}"/>
  <g transform="translate(7 7) scale(0.75)" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>
  </g>
</svg>`;

function createIco(images) {
  const headerSize = 6 + images.length * 16;
  let dataOffset = headerSize;
  const header = Buffer.alloc(headerSize);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  for (let index = 0; index < images.length; index += 1) {
    const { size, buffer } = images[index];
    const entryOffset = 6 + index * 16;

    header.writeUInt8(size >= 256 ? 0 : size, entryOffset);
    header.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(buffer.length, entryOffset + 8);
    header.writeUInt32LE(dataOffset, entryOffset + 12);
    dataOffset += buffer.length;
  }

  return Buffer.concat([header, ...images.map((image) => image.buffer)]);
}

async function main() {
  const sizes = [16, 32, 48];
  const images = await Promise.all(
    sizes.map(async (size) => ({
      size,
      buffer: await sharp(Buffer.from(compassIconSvg))
        .resize(size, size)
        .png()
        .toBuffer(),
    })),
  );

  const ico = createIco(images);
  const outputPath = join(__dirname, "../app/favicon.ico");

  writeFileSync(outputPath, ico);
  console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
