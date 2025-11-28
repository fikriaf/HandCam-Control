# Performance Optimization Guide

Panduan lengkap untuk mengoptimalkan performa Hand Gesture Control, terutama untuk Electron.

## 🐌 Kenapa Lag/Patah-patah?

### Penyebab Utama:
1. **Tidak Ada GPU** - Rendering tanpa GPU sangat lambat
2. **GPU Disabled** - Electron disable GPU untuk fix error
3. **Resolusi Terlalu Tinggi** - 1280x720 terlalu berat
4. **Terlalu Banyak Deteksi** - 2 tangan + visualization penuh
5. **CPU Lemah** - Prosesor tidak cukup kuat

## ⚡ Solusi Cepat

### 1. Enable GPU (Recommended)

Edit `electron/main.js`, **comment out** baris ini:

```javascript
// app.disableHardwareAcceleration();  // ← Comment ini!
```

**Restart Electron**:
```bash
npm run electron
```

Jika masih error GPU, baru uncomment lagi.

### 2. Gunakan Mode Performa Rendah

Edit `src/js/config/electronConfig.js`, ganti mode:

```javascript
// Ganti dari MEDIUM ke LOW atau ULTRA_LOW
export const electronOptimizedConfig = PERFORMANCE_MODES.LOW;  // atau ULTRA_LOW
```

**Rebuild**:
```bash
npm run electron
```

### 3. Turunkan Resolusi Manual

Edit `src/js/config/systemConfig.js`:

```javascript
camera: {
  resolution: {
    width: 320,   // Sangat rendah untuk PC lemah
    height: 240
  },
  fps: 15         // FPS lebih rendah
}
```

### 4. Disable Visualization

Klik tombol **"Toggle Visualization"** di UI, atau edit config:

```javascript
visualization: {
  enabled: false  // Matikan semua visualization
}
```

## 🎯 Performance Modes

### ULTRA_LOW (Untuk PC Sangat Lemah)
- Resolution: 320x240
- FPS: 15
- Max Hands: 1
- Visualization: Minimal
- **Best for**: PC tanpa GPU, CPU lemah

### LOW (Untuk PC Lemah)
- Resolution: 640x480
- FPS: 20
- Max Hands: 1
- Visualization: Basic
- **Best for**: PC dengan GPU lemah

### MEDIUM (Default Electron)
- Resolution: 640x480
- FPS: 30
- Max Hands: 1
- Visualization: Standard
- **Best for**: PC mid-range

### HIGH (Untuk PC Kuat)
- Resolution: 1280x720
- FPS: 30
- Max Hands: 2
- Visualization: Full
- **Best for**: PC dengan GPU bagus

## 🔧 Cara Ganti Mode

### Method 1: Edit Config File

1. Buka `src/js/config/electronConfig.js`
2. Ganti baris ini:
   ```javascript
   export const electronOptimizedConfig = PERFORMANCE_MODES.MEDIUM;
   ```
   Menjadi:
   ```javascript
   export const electronOptimizedConfig = PERFORMANCE_MODES.LOW;
   // atau ULTRA_LOW untuk PC sangat lemah
   ```
3. Rebuild: `npm run electron`

### Method 2: Edit System Config Langsung

Buka `src/js/config/systemConfig.js` dan edit:

```javascript
camera: {
  resolution: {
    width: 320,    // Turunkan ini
    height: 240    // Dan ini
  },
  fps: 15          // Turunkan FPS
},

mediapipe: {
  maxNumHands: 1   // Hanya 1 tangan
},

visualization: {
  enabled: false,  // Matikan visualization
  showConnections: false,
  showBoundingBox: false
}
```

## 🚀 Optimasi Tambahan

### 1. Close Other Apps
- Tutup browser dengan banyak tab
- Tutup aplikasi berat lainnya
- Check Task Manager

### 2. Reduce Gesture Detectors

Edit `src/js/main.js`, comment detector yang tidak perlu:

```javascript
initializeGestureDetectors() {
  // Hanya aktifkan yang perlu
  const swipeDetector = new SwipeDetector(...);
  this.gestureEngine.registerDetector('swipe', swipeDetector);
  
  // Comment yang tidak perlu
  // const pinchDetector = new PinchDetector(...);
  // const pushDetector = new PushDetector(...);
  // const staticDetector = new StaticGestureDetector(...);
}
```

### 3. Increase Frame Skip

Edit `src/js/config/systemConfig.js`:

```javascript
performance: {
  targetFPS: 15,              // Lower FPS
  frameSkipThreshold: 100,    // Skip more frames
  historyBufferSize: 5        // Smaller buffer
}
```

### 4. Disable Smoothing

Edit `src/js/config/gestureConfig.js`:

```javascript
swipe: {
  smoothingWindow: 1,  // No smoothing
  debounceMs: 500      // Longer debounce
}
```

## 📊 Benchmark Your System

Jalankan app dan check FPS counter:

- **FPS > 25**: Good, bisa pakai MEDIUM/HIGH
- **FPS 15-25**: Okay, pakai LOW
- **FPS < 15**: Bad, pakai ULTRA_LOW

## 🎮 GPU vs No GPU

### Dengan GPU:
- ✅ Smooth 30-60 FPS
- ✅ High resolution (1280x720)
- ✅ Full visualization
- ✅ 2 hands detection

### Tanpa GPU (CPU only):
- ⚠️ Lag/patah-patah
- ⚠️ Harus pakai low resolution
- ⚠️ Disable visualization
- ⚠️ 1 hand only
- ⚠️ Lower FPS (15-20)

## 🔍 Check GPU Status

### Windows:
1. Buka Task Manager (Ctrl+Shift+Esc)
2. Tab "Performance"
3. Lihat "GPU" - jika ada, berarti punya GPU
4. Check usage saat run app

### Check di Electron:
1. Buka DevTools (F12)
2. Console tab
3. Ketik: `chrome://gpu`
4. Lihat GPU info

## 💡 Rekomendasi Berdasarkan Hardware

### PC Tanpa GPU / GPU Lemah:
```javascript
// electron/main.js
app.disableHardwareAcceleration();  // Keep disabled

// electronConfig.js
export const electronOptimizedConfig = PERFORMANCE_MODES.ULTRA_LOW;
```

### PC Dengan GPU Integrated (Intel HD):
```javascript
// electron/main.js
// app.disableHardwareAcceleration();  // Comment out

// electronConfig.js
export const electronOptimizedConfig = PERFORMANCE_MODES.LOW;
```

### PC Dengan GPU Dedicated (NVIDIA/AMD):
```javascript
// electron/main.js
// app.disableHardwareAcceleration();  // Comment out

// electronConfig.js
export const electronOptimizedConfig = PERFORMANCE_MODES.MEDIUM;
// atau HIGH jika GPU kuat
```

## 🆘 Masih Lag?

### Last Resort Options:

1. **Gunakan Web Mode Instead**
   ```bash
   npm start
   ```
   Web mode biasanya lebih smooth karena browser optimize GPU better.

2. **Reduce Everything**
   - Resolution: 320x240
   - FPS: 10
   - Visualization: OFF
   - Max Hands: 1
   - Only 1 gesture detector

3. **Upgrade Hardware**
   - Add GPU
   - Upgrade CPU
   - Add RAM

## 📝 Quick Settings Template

### Ultra Low (Copy-paste ke systemConfig.js):
```javascript
camera: { resolution: { width: 320, height: 240 }, fps: 15 },
mediapipe: { maxNumHands: 1, minDetectionConfidence: 0.7 },
performance: { targetFPS: 15, frameSkipThreshold: 100 },
visualization: { enabled: false }
```

### Low:
```javascript
camera: { resolution: { width: 640, height: 480 }, fps: 20 },
mediapipe: { maxNumHands: 1, minDetectionConfidence: 0.6 },
performance: { targetFPS: 20, frameSkipThreshold: 60 },
visualization: { enabled: true, showConnections: false }
```

### Medium:
```javascript
camera: { resolution: { width: 640, height: 480 }, fps: 30 },
mediapipe: { maxNumHands: 1, minDetectionConfidence: 0.5 },
performance: { targetFPS: 30, frameSkipThreshold: 40 },
visualization: { enabled: true, showConnections: false }
```

## 🎯 Summary

**Untuk PC Tanpa GPU atau Lemah**:
1. Enable GPU di electron/main.js (comment disable line)
2. Gunakan ULTRA_LOW atau LOW mode
3. Disable visualization
4. Atau pakai web mode (`npm start`)

**Untuk PC Dengan GPU**:
1. Enable GPU (comment disable line)
2. Gunakan MEDIUM atau HIGH mode
3. Enjoy smooth performance!

---

**Quick Fix Command**:
```bash
# 1. Edit electron/main.js - comment GPU disable
# 2. Edit electronConfig.js - ganti ke LOW/ULTRA_LOW
# 3. Rebuild
npm run electron
```
