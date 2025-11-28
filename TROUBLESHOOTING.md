# Troubleshooting Guide

Common issues and solutions for Hand Gesture Control System.

## 🔴 Electron Issues

### Issue: Camera Not Starting in Electron

**Symptoms**:
- Click "Start Camera" but nothing happens
- Black screen in video area
- No error message

**Solutions**:

1. **Build First (Most Common)**
   ```bash
   npm run build
   npm run electron
   ```
   Or use the shortcut:
   ```bash
   npm run electron  # This builds automatically
   ```

2. **Check Build Output**
   - Ensure `dist/` folder exists
   - Check `dist/index.html` is present
   - Verify `dist/bundle.js` exists

3. **Check Console Errors**
   - Press F12 in Electron window
   - Look for errors in Console tab
   - Common errors:
     - "Cannot find module" → Run build
     - "MediaPipe failed" → Check internet connection
     - "Camera permission denied" → Check Windows settings

4. **Camera Permissions (Windows)**
   - Open Windows Settings
   - Go to Privacy → Camera
   - Enable "Allow apps to access your camera"
   - Enable for desktop apps

5. **Close Other Apps**
   - Close Zoom, Skype, Teams, etc.
   - Only one app can use camera at a time

### Issue: GPU Process Error

**Symptoms**:
```
ERROR:gpu_process_host.cc(991)] GPU process exited unexpectedly
```

**Solution**: Already fixed! The app disables GPU acceleration automatically.

If still occurs:
```bash
# Edit electron/main.js and ensure this line exists:
app.disableHardwareAcceleration();
```

### Issue: "Cannot find module '@mediapipe/tasks-vision'"

**Solution**:
```bash
npm install
npm run build
npm run electron
```

### Issue: Blank White Screen

**Causes**:
- Build not completed
- Wrong path in electron/main.js
- Missing dist folder

**Solutions**:
1. Delete `dist/` folder
2. Run `npm run build`
3. Check for build errors
4. Run `npm run electron`

## 🌐 Web Mode Issues

### Issue: Camera Permission Denied

**Solution**:
1. Click the camera icon in browser address bar
2. Select "Always allow"
3. Refresh page

### Issue: HTTPS Required Error

**Solution**: 
- Development: Use `npm start` (localhost is allowed)
- Production: Deploy with HTTPS

### Issue: MediaPipe Model Loading Failed

**Solutions**:
1. Check internet connection
2. Try offline mode:
   - Download model manually
   - Place in `src/models/`
   - Enable offline in config

## 🖐️ Gesture Detection Issues

### Issue: Gestures Not Detected

**Solutions**:

1. **Lighting**
   - Use bright, even lighting
   - Avoid backlighting
   - Natural daylight is best

2. **Hand Position**
   - Keep hand 50-100cm from camera
   - Ensure full hand is visible
   - No gloves or coverings

3. **Background**
   - Use plain background
   - Avoid busy patterns
   - Contrast with hand color

4. **Adjust Thresholds**
   Edit `src/js/config/gestureConfig.js`:
   ```javascript
   swipe: {
     velocityThreshold: 0.3,  // Lower = more sensitive
     debounceMs: 200          // Lower = faster detection
   }
   ```

### Issue: False Positives (Too Sensitive)

**Solutions**:

1. **Increase Thresholds**
   ```javascript
   swipe: {
     velocityThreshold: 0.7,  // Higher = less sensitive
     debounceMs: 500          // Higher = slower detection
   }
   ```

2. **Enable More Smoothing**
   ```javascript
   swipe: {
     smoothingWindow: 10      // Higher = smoother
   }
   ```

### Issue: Specific Gesture Not Working

**Swipe Not Detected**:
- Move hand faster
- Move at least 10cm
- Keep movement straight

**Pinch Not Detected**:
- Bring fingers closer together
- Hold pinch firmly
- Check `distanceThreshold` in config

**Static Gesture Not Detected**:
- Hold gesture longer (1-2 seconds)
- Ensure correct finger positions
- Check `holdDuration` in config

## 🐌 Performance Issues

### Issue: Low FPS (< 20)

**Solutions**:

1. **Reduce Resolution**
   Edit `src/js/config/systemConfig.js`:
   ```javascript
   camera: {
     resolution: { width: 640, height: 480 }  // Lower resolution
   }
   ```

2. **Disable Visualization**
   - Click "Toggle Visualization" button
   - Or edit config:
   ```javascript
   visualization: {
     enabled: false
   }
   ```

3. **Close Other Apps**
   - Close browser tabs
   - Close resource-intensive apps
   - Check Task Manager

4. **Reduce Max Hands**
   ```javascript
   mediapipe: {
     maxNumHands: 1  // Detect only 1 hand
   }
   ```

### Issue: High CPU Usage

**Solutions**:
1. Lower FPS target
2. Reduce camera resolution
3. Disable visualization
4. Use only needed gestures

## 🔧 Build Issues

### Issue: npm install Fails

**Solutions**:
```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rmdir /s /q node_modules  # Windows
rm -rf node_modules       # Mac/Linux

# Reinstall
npm install
```

### Issue: Webpack Build Fails

**Solutions**:
1. Check Node.js version (16+ required)
2. Update npm: `npm install -g npm@latest`
3. Check for syntax errors in code
4. Delete `dist/` and rebuild

### Issue: Electron Build Fails

**Solutions**:
```bash
# Install electron-builder globally
npm install -g electron-builder

# Try building again
npm run build:win
```

## 📱 Platform-Specific Issues

### Windows

**Issue: Antivirus Blocking**
- Add exception for the app
- Temporarily disable antivirus
- Run as administrator

**Issue: Camera Not Found**
- Check Device Manager
- Update camera drivers
- Test camera in Camera app

### macOS

**Issue: Camera Permission**
- System Preferences → Security & Privacy → Camera
- Enable for Terminal/Electron

**Issue: Code Signing**
- Required for distribution
- Use developer certificate

### Linux

**Issue: Camera Not Working**
```bash
# Check camera device
ls /dev/video*

# Test with v4l2
v4l2-ctl --list-devices

# Grant permissions
sudo usermod -a -G video $USER
```

## 🆘 Still Having Issues?

1. **Check Console**
   - Press F12
   - Look for errors
   - Copy error messages

2. **Check Logs**
   - Look in gesture log
   - Check for error messages
   - Note when issue occurs

3. **Gather Information**
   - OS version
   - Browser/Electron version
   - Camera model
   - Error messages
   - Steps to reproduce

4. **Get Help**
   - Read all documentation
   - Search existing issues
   - Open new GitHub issue with details

## 📚 Additional Resources

- [README.md](README.md) - Main documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick setup
- [ELECTRON_GUIDE.md](ELECTRON_GUIDE.md) - Electron details
- [GESTURE_GUIDE.md](GESTURE_GUIDE.md) - Gesture instructions
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Development guide

## 💡 Pro Tips

1. **Always build before running Electron**
2. **Use good lighting for best results**
3. **Start with simple gestures (open palm)**
4. **Adjust thresholds to your preference**
5. **Check console for helpful error messages**
6. **Test in web mode first (easier to debug)**

---

**Quick Fix Checklist**:
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Check camera permissions
- [ ] Close other camera apps
- [ ] Use good lighting
- [ ] Check console for errors
- [ ] Try web mode first (`npm start`)
