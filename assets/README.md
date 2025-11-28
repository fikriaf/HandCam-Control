# Assets Directory

This directory contains application icons and images.

## Required Icons for Electron Build

To build the Electron desktop app, you need to provide icons for each platform:

### Windows
- **File**: `icon.ico`
- **Format**: ICO
- **Sizes**: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256

### macOS
- **File**: `icon.icns`
- **Format**: ICNS
- **Sizes**: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024

### Linux
- **File**: `icon.png`
- **Format**: PNG
- **Size**: 512x512 (recommended)

## Creating Icons

You can use online tools or software to create icons:

- [Icon Converter](https://convertico.com/)
- [CloudConvert](https://cloudconvert.com/)
- [Electron Icon Maker](https://www.npmjs.com/package/electron-icon-maker)

## Using electron-icon-maker

```bash
npm install -g electron-icon-maker

# Create icons from a single PNG (1024x1024 recommended)
electron-icon-maker --input=icon-source.png --output=./assets
```

## Placeholder

Until you provide custom icons, the Electron app will use default icons.
