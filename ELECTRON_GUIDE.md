# Electron Desktop App Guide

Guide lengkap untuk menjalankan Hand Gesture Control sebagai desktop app dengan Electron.

## ⚠️ Important: Build Required

Electron app **HARUS di-build terlebih dahulu** sebelum dijalankan karena:
1. MediaPipe memerlukan webpack bundling
2. ES6 modules perlu di-transpile
3. Dependencies perlu di-bundle

## 🚀 Quick Start

### Method 1: Build & Run (Recommended)

```bash
# Build dan jalankan Electron
npm run electron
```

Ini akan:
1. Build aplikasi dengan webpack (production mode)
2. Jalankan Electron dengan hasil build

### Method 2: Development Build & Run

```bash
# Build development dan jalankan
npm run electron:dev
```

Ini akan:
1. Build aplikasi dengan webpack (development mode)
2. Jalankan Electron dengan hasil build
3. Include source maps untuk debugging

## 📦 Building Standalone Apps

### Windows

```bash
npm run build:win
```

Output: `build/Hand Gesture Control Setup.exe`

### macOS

```bash
npm run build:mac
```

Output: `build/Hand Gesture Control.dmg`

### Linux

```bash
npm run build:linux
```

Output: `build/Hand Gesture Control.AppImage`

### All Platforms

```bash
npm run build:all
```

## 🔧 Troubleshooting

### Issue: "Cannot find module" Error

**Solution**: Run build first
```bash
npm run build
npm run electron
```

### Issue: GPU Process Error (Windows)

**Solution**: Already fixed! The app disables GPU acceleration automatically.

### Issue: Camera Not Working

**Possible Causes**:
1. Camera permission not granted
2. Camera in use by another app
3. Antivirus blocking camera access

**Solutions**:
1. Check Windows camera permissions
2. Close other apps using camera
3. Temporarily disable antivirus
4. Try running as administrator

### Issue: MediaPipe Model Not Loading

**Solution**: Ensure internet connection for first run (downloads model)

For offline use:
1. Download model manually: https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
2. Place in `src/models/hand_landmarker.task`
3. Enable offline mode in config

### Issue: Black Screen

**Solution**: 
1. Check console for errors (F12)
2. Ensure build completed successfully
3. Try rebuilding: `npm run build`

## 🎯 Electron vs Web Mode

| Feature | Web Mode | Electron Mode |
|---------|----------|---------------|
| Installation | None | Build required |
| Performance | Good | Better |
| Offline | Limited | Full support |
| Camera Access | Browser permission | Auto-granted |
| Distribution | URL | Executable file |
| Updates | Instant | Manual/Auto-update |

## 📝 Configuration

### Electron-Specific Settings

Edit `electron/main.js` for:
- Window size
- GPU acceleration
- DevTools
- Permissions

### App Settings

Edit `src/js/config/systemConfig.js` for:
- Camera resolution
- MediaPipe settings
- Performance options

## 🔐 Permissions

Electron automatically grants:
- ✅ Camera access
- ✅ Microphone access (if needed)
- ✅ File system access

No manual permission required!

## 📊 Performance Tips

1. **Close Other Apps**: Free up system resources
2. **Good Lighting**: Better detection = less CPU
3. **Lower Resolution**: Edit config if needed
4. **Disable Visualization**: If FPS is low

## 🐛 Debug Mode

Enable DevTools in development:

Edit `electron/main.js`:
```javascript
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools();
}
```

Run with:
```bash
set NODE_ENV=development
npm run electron
```

## 📦 Distribution

### Package Size

- Windows: ~150MB
- macOS: ~180MB
- Linux: ~160MB

Includes:
- Electron runtime
- Chromium engine
- Node.js
- Your app code
- MediaPipe models

### Reducing Size

1. Use asar compression (already enabled)
2. Exclude dev dependencies
3. Use electron-builder compression

## 🔄 Auto-Update (Optional)

To enable auto-updates:

1. Setup update server
2. Configure electron-updater
3. Implement update UI

See `electron-builder` documentation for details.

## 🎨 Customization

### Change App Icon

1. Create icons (see `assets/README.md`)
2. Place in `assets/` folder
3. Rebuild app

### Change App Name

Edit `electron/package.json`:
```json
{
  "build": {
    "productName": "Your App Name"
  }
}
```

## 📱 Platform-Specific Notes

### Windows
- Requires Visual C++ Redistributable
- May trigger Windows Defender (first run)
- GPU acceleration disabled by default

### macOS
- Requires code signing for distribution
- Notarization needed for Gatekeeper
- Camera permission prompt on first run

### Linux
- AppImage is portable (no installation)
- May need to mark as executable
- Works on most distributions

## 🆘 Getting Help

If you encounter issues:

1. Check this guide
2. Check console errors (F12)
3. Read `README.md`
4. Open GitHub issue

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Guide](https://www.electron.build/)
- [MediaPipe Hands](https://mediapipe.dev/solutions/hands)

---

**Remember**: Always run `npm run electron` (not `electron electron/main.js` directly)
