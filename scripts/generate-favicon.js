const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

async function generateFavicon() {
  try {
    console.log('Generating favicon from SVG...');
    
    // Read the SVG file
    const svgBuffer = fs.readFileSync(path.resolve(__dirname, '../public/feather-icon.svg'));
    
    // Convert to PNG with different sizes
    const sizes = [16, 32, 48, 64, 128, 256];
    
    // Create the favicon directory if it doesn't exist
    const faviconDir = path.resolve(__dirname, '../public/favicon');
    if (!fs.existsSync(faviconDir)) {
      fs.mkdirSync(faviconDir, { recursive: true });
    }
    
    const pngFiles = [];
    
    // Generate PNGs of different sizes
    for (const size of sizes) {
      const pngPath = path.resolve(faviconDir, `favicon-${size}x${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(pngPath);
      
      pngFiles.push(pngPath);
      console.log(`Generated ${size}x${size} PNG`);
    }
    
    // Create a 32x32 PNG as the main favicon.png
    const mainPngPath = path.resolve(__dirname, '../public/favicon.png');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(mainPngPath);
    
    console.log('Favicon PNG generated successfully!');
    
    // Convert PNGs to ICO
    console.log('Converting PNGs to ICO...');
    const icoBuffer = await pngToIco(pngFiles);
    fs.writeFileSync(path.resolve(__dirname, '../public/favicon.ico'), icoBuffer);
    
    console.log('Favicon ICO generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon(); 