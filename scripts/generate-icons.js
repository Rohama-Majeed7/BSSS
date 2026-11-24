const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const outDir = path.join(process.cwd(), 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

function makePng(width, height, isMaskable) {
  const buffer = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const maxR = width / 2;
  
  // Safe zone radius
  const outerR = isMaskable ? maxR * 0.78 : maxR * 0.90;
  const innerR = outerR * 0.88;
  const coreR = innerR * 0.76;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 15, g = 35, b = 71, a = 255; // #0f2347 (Royal Blue)

      if (!isMaskable && dist > maxR) {
        // Transparent outside bounds
        r = 0; g = 0; b = 0; a = 0;
      } else if (dist <= outerR && dist > innerR) {
        // Gold outer ring
        r = 251; g = 191; b = 36; a = 255; // #fbbf24
      } else if (dist <= innerR && dist > coreR) {
        // Navy blue middle ring
        r = 10; g = 24; b = 50; a = 255;
      } else if (dist <= coreR) {
        // Core emblem
        const angle = Math.atan2(dy, dx);
        const arm = Math.cos(5 * angle);
        const starDist = dist / coreR;
        if (starDist < 0.65 + 0.35 * arm) {
          // Gold Star
          r = 245; g = 158; b = 11; a = 255; // Amber/Gold
          if (starDist < 0.25) {
            // Bright center core
            r = 255; g = 255; b = 255; a = 255;
          }
        } else {
          // Deep royal blue inside ring
          r = 15; g = 35; b = 71; a = 255;
        }
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // Scanlines with filter 0
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (width * 4 + 1)] = 0;
    buffer.copy(scanlines, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(scanlines);

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    let crc = -1;
    for (let i = 4; i < 8 + len; i++) {
      let b = buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (((crc ^ b) & 1) ? 0xedb88320 : 0);
        b >>>= 1;
      }
    }
    buf.writeInt32BE(~crc, 8 + len);
    return buf;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

fs.writeFileSync(path.join(outDir, 'icon-192x192.png'), makePng(192, 192, false));
fs.writeFileSync(path.join(outDir, 'icon-512x512.png'), makePng(512, 512, false));
fs.writeFileSync(path.join(outDir, 'icon-maskable-192x192.png'), makePng(192, 192, true));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512x512.png'), makePng(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), makePng(180, 180, false));

// Also generate a 48x48 icon for favicon
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), makePng(48, 48, false));

// SVG Vector Icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#0f2347"/>
  <circle cx="256" cy="256" r="210" fill="none" stroke="#fbbf24" stroke-width="16"/>
  <circle cx="256" cy="256" r="185" fill="#0a1832"/>
  <polygon points="256,90 295,200 410,200 318,270 353,380 256,312 159,380 194,270 102,200 217,200" fill="#fbbf24"/>
  <circle cx="256" cy="256" r="45" fill="#ffffff" opacity="0.9"/>
  <text x="256" y="450" font-family="sans-serif" font-size="42" font-weight="900" fill="#fbbf24" text-anchor="middle" letter-spacing="4">BRIGHT STARS</text>
</svg>`;
fs.writeFileSync(path.join(outDir, 'icon.svg'), svgIcon, 'utf8');

console.log('All PWA icons created successfully in public/icons/');
