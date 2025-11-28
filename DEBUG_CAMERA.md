# Debug Camera Issues

## Quick Debug Steps

### 1. Check Console Errors

Press **F12** → Console tab

Look for errors like:
- "Camera permission denied"
- "getUserMedia is not supported"
- "MediaPipe failed to load"
- "Cannot find module"

### 2. Test Camera Directly

Open browser console (F12) and run:

```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('✅ Camera works!', stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => {
    console.error('❌ Camera error:', err);
  });
```

### 3. Check Camera Permissions

**Windows**:
1. Settings → Privacy → Camera
2. Enable "Allow apps to access your camera"
3. Enable for browsers/desktop apps

**Browser**:
1. Click camera icon in address bar
2. Select "Always allow"
3. Refresh page

### 4. Check if Camera is in Use

- Close Zoom, Skype, Teams, etc.
- Only one app can use camera at a time
- Check Task Manager for apps using camera

### 5. Try Different Browser

- Chrome (best support)
- Firefox
- Edge

### 6. Check Build

For Electron:
```bash
# Make sure you built first
npm run build

# Then run
npm run electron
```

For Web:
```bash
# Just run
npm start
```

## Common Issues

### Issue: "Camera permission denied"

**Solution**:
1. Check browser/Windows permissions
2. Refresh page
3. Try different browser

### Issue: "getUserMedia is not supported"

**Solution**:
- Use modern browser (Chrome 90+)
- Use HTTPS (or localhost)
- Update browser

### Issue: "MediaPipe failed to load"

**Solution**:
1. Check internet connection
2. Wait longer (model is 9MB)
3. Check console for specific error

### Issue: Black screen / No video

**Solution**:
1. Check camera is not covered
2. Check camera works in other apps
3. Try different camera (if multiple)
4. Update camera drivers

### Issue: Button does nothing

**Solution**:
1. Check console for errors (F12)
2. Make sure build completed
3. Try web mode: `npm start`

## Test Commands

### Test Web Mode:
```bash
npm start
```
Open: http://localhost:8080
Click "Start Camera"

### Test Electron:
```bash
npm run build
npm run electron
```
Click "Start Camera"

## Enable Verbose Logging

Edit `src/js/main.js`, add at top of `startCamera()`:

```javascript
async startCamera() {
  console.log('🎥 Starting camera...');
  console.log('Config:', this.systemConfig.camera);
  
  if (this.running) {
    console.log('⚠️ Already running');
    return;
  }

  try {
    console.log('📹 Requesting camera stream...');
    await this.cameraManager.startStream();
    console.log('✅ Camera stream started');
    
    // ... rest of code
  } catch (error) {
    console.error('❌ Camera error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
  }
}
```

## Quick Fix Script

Run this in browser console (F12):

```javascript
// Test 1: Check if getUserMedia exists
console.log('getUserMedia supported:', !!navigator.mediaDevices?.getUserMedia);

// Test 2: List cameras
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(d => d.kind === 'videoinput');
    console.log('Cameras found:', cameras.length);
    cameras.forEach(cam => console.log('  -', cam.label || 'Unknown camera'));
  });

// Test 3: Try to access camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('✅ SUCCESS! Camera works!');
    console.log('Stream:', stream);
    stream.getTracks().forEach(track => {
      console.log('Track:', track.label, track.readyState);
      track.stop();
    });
  })
  .catch(err => {
    console.error('❌ FAILED! Error:', err.name, err.message);
    if (err.name === 'NotAllowedError') {
      console.log('→ Permission denied. Check browser settings.');
    } else if (err.name === 'NotFoundError') {
      console.log('→ No camera found. Check if camera is connected.');
    } else if (err.name === 'NotReadableError') {
      console.log('→ Camera in use by another app.');
    }
  });
```

## Still Not Working?

### Last Resort:

1. **Restart Computer**
2. **Update Browser**
3. **Update Camera Drivers**
4. **Try Different Computer**
5. **Check if camera physically works** (test in Camera app)

## Get Help

If still not working, provide:
1. OS version (Windows 10/11?)
2. Browser/Electron version
3. Console errors (F12 → Console)
4. What happens when click "Start Camera"
5. Does camera work in other apps?

---

**Most Common Fix**: Check camera permissions in Windows Settings!
