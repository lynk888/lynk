const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets');

// Ensure the assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Create a simple blue square for the icon
sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: 173, g: 216, b: 230, alpha: 1 } // Light blue
  }
})
.png()
.toFile(path.join(ASSETS_DIR, 'icon.png'))
.catch(err => console.error('Error generating icon:', err));

// Create splash screen
sharp({
  create: {
    width: 1242,
    height: 2436,
    channels: 4,
    background: { r: 173, g: 216, b: 230, alpha: 1 } // Light blue
  }
})
.png()
.toFile(path.join(ASSETS_DIR, 'splash.png'))
.catch(err => console.error('Error generating splash:', err));

// Create adaptive icon
sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: 173, g: 216, b: 230, alpha: 1 } // Light blue
  }
})
.png()
.toFile(path.join(ASSETS_DIR, 'adaptive-icon.png'))
.catch(err => console.error('Error generating adaptive icon:', err));

console.log('Asset generation complete. Check the assets directory.'); 