const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateOgImage() {
  try {
    console.log('Generating OpenGraph image from SVG...');
    
    // Read the SVG file
    const svgBuffer = fs.readFileSync(path.resolve(__dirname, '../public/og-image.svg'));
    
    // Convert to PNG
    await sharp(svgBuffer)
      .resize(1200, 630)
      .png()
      .toFile(path.resolve(__dirname, '../public/og-image.png'));
    
    console.log('OpenGraph image generated successfully!');
  } catch (error) {
    console.error('Error generating OpenGraph image:', error);
    process.exit(1);
  }
}

generateOgImage(); 