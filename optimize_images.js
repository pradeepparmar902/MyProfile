const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, 'public', 'logo.png');
const ogOutput = path.join(__dirname, 'src', 'app', 'opengraph-image.jpg');
const iconOutput = path.join(__dirname, 'src', 'app', 'icon.png');

async function process() {
  await sharp(input)
    .resize(600, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .jpeg({ quality: 85 })
    .toFile(ogOutput);

  await sharp(input)
    .resize(256, 256)
    .png({ quality: 80 })
    .toFile(iconOutput);

  console.log('Images optimized successfully.');
}

process().catch(console.error);
