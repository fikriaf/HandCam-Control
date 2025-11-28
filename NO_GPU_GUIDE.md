# Guide untuk PC Tanpa GPU / GPU Lemah

Panduan khusus untuk menjalankan Hand Gesture Control di PC tanpa GPU atau GPU yang tidak support.

## ⚠️ Situasi Anda

Jika Anda melihat error seperti ini:
```
GPU process exited unexpectedly: exit_code=-1073740791
vector[] index out of bounds
```

Berarti **GPU Anda tidak support** atau **tidak ada GPU dedicated**.

## ✅ Solusi: Gunakan Web Mode

**REKOMENDASI TERBAIK**: Gunakan web mode instead of Electron!

```bash
npm start
```

### Kenapa Web Mode Lebih Baik?

| Feature | Web Mode | Electron (No GPU) |
|---------|----------|-------------------|
| Performance | ⚡ Smooth | 🐌 Lag |
| FPS | 30-60 | 5-15 |
| Resolution | 1280x720 | 320x240 |
| Setup | Easy | Complex |
| GPU | Browser optimized | Disabled |

**Browser sudah optimize GPU handling dengan baik**, jadi web mode akan jauh lebih smooth!

## 🔧 Jika Tetap Ingin Pakai Electron

### Step 1: Pastikan Settings Sudah Optimal

File `src/js/config/electronConfig.js` sudah di-set ke `ULTRA_LOW`:

```javascript
export const electronOptimizedConfig = PERFORMANCE_MODES.ULTRA_LOW;
```

### Step 2: Jika Masih Lag, Gunakan EXTREME_LOW

Edit `src/js/config/electronConfig.js`:

```javascript
export const electronOptimizedConfig = PERFORMANCE_MODES.EXTREME_LOW;
```

Rebuild:
```bash
npm run electron
```

### Step 3: Disable Semua Visualization

Edit `src/js/config/systemConfig.js`:

```javascript
visualization: {
  enabled: false,  // Matikan semua
  showLandmarks: false,
  showConnections: false,
  showLabels: false,
  showFPS: true,  // Hanya FPS
  showBoundingBox: false
}
```

### Step 4: Gunakan Hanya 1 Gesture Detector

Edit `src/js/main.js`, comment detector yang tidak perlu:

```javascript
initializeGestureDetectors() {
  // Hanya aktifkan swipe
  const swipeDetector = new SwipeDetector(
    this.gestureConfig.swipe,
    this.landmarkProcessor
  );
  this.gestureEngine.registerDetector('swipe', swipeDetector);

  // Comment semua yang lain
  /*
  const pinchDetector = new PinchDetector(...);
  const pushDetector = new PushDetector(...);
  const staticDetector = new StaticGestureDetector(...);
  */
}
```

## 📊 Expected Performance (No GPU)

### ULTRA_LOW Mode:
- Resolution: 320x240
- FPS: 10-15
- Lag: Sedikit
- Usable: Ya, tapi tidak smooth

### EXTREME_LOW Mode:
- Resolution: 160x120
- FPS: 5-10
- Lag: Banyak
- Usable: Barely

### Web Mode (Browser):
- Resolution: 1280x720
- FPS: 30-60
- Lag: Minimal
- Usable: ✅ Smooth!

## 🎯 Rekomendasi Berdasarkan Hardware

### PC Tanpa GPU Dedicated:
```
✅ BEST: npm start (web mode)
⚠️ OK: Electron ULTRA_LOW
❌ BAD: Electron MEDIUM/HIGH
```

### PC Dengan Intel HD Graphics:
```
✅ BEST: npm start (web mode)
✅ OK: Electron LOW
⚠️ MAYBE: Electron MEDIUM
```

### PC Dengan GPU Dedicated (NVIDIA/AMD):
```
✅ BEST: Electron MEDIUM/HIGH
✅ GOOD: npm start (web mode)
```

## 🚀 Quick Commands

### Recommended (Web Mode):
```bash
npm start
```
Buka: http://localhost:8080

### Electron (Ultra Low):
```bash
npm run electron
```

### Electron (Extreme Low):
1. Edit `electronConfig.js` → `EXTREME_LOW`
2. Run: `npm run electron`

## 💡 Tips untuk PC Lemah

### 1. Close Everything
- Tutup semua browser tabs
- Tutup aplikasi lain
- Check Task Manager

### 2. Lower Expectations
- Jangan expect 60 FPS
- 10-15 FPS sudah cukup untuk gesture control
- Gerakan harus lebih pelan dan deliberate

### 3. Optimize Gestures
- Gunakan hanya gesture yang perlu
- Swipe paling ringan
- Pinch/Static lebih berat

### 4. Good Lighting
- Lighting bagus = deteksi lebih cepat
- Deteksi cepat = less CPU usage

## 🔍 Troubleshooting

### Masih Lag di ULTRA_LOW?

**Coba EXTREME_LOW**:
```javascript
export const electronOptimizedConfig = PERFORMANCE_MODES.EXTREME_LOW;
```

### Masih Lag di EXTREME_LOW?

**Gunakan Web Mode**:
```bash
npm start
```

### Web Mode Juga Lag?

**Upgrade Hardware** atau **Lower Browser Resolution**:
1. Zoom out browser (Ctrl + -)
2. Resize window jadi lebih kecil
3. Close other tabs

## 📝 Settings Comparison

### EXTREME_LOW (Last Resort):
```javascript
{
  resolution: 160x120,
  fps: 5,
  maxHands: 1,
  visualization: OFF,
  targetFPS: 5
}
```

### ULTRA_LOW (Default No GPU):
```javascript
{
  resolution: 320x240,
  fps: 10,
  maxHands: 1,
  visualization: MINIMAL,
  targetFPS: 10
}
```

### LOW (Integrated GPU):
```javascript
{
  resolution: 640x480,
  fps: 20,
  maxHands: 1,
  visualization: BASIC,
  targetFPS: 20
}
```

## 🎮 Alternative: Use Web Mode

Seriously, **just use web mode**:

```bash
npm start
```

Benefits:
- ✅ Much smoother
- ✅ Better GPU handling
- ✅ Higher resolution
- ✅ Better FPS
- ✅ Easier to use
- ✅ No build required

The only downside:
- ❌ Not a standalone app
- ❌ Need browser open

But performance is **WAY BETTER**!

## 🆘 Still Not Working?

### Option 1: Use Different Browser
- Try Chrome (best GPU support)
- Try Firefox
- Try Edge

### Option 2: Upgrade Hardware
- Add GPU (even cheap one helps)
- Upgrade CPU
- Add RAM

### Option 3: Use Different Computer
- Try on another PC
- Use laptop with better specs

## 📞 Summary

**TL;DR untuk PC tanpa GPU**:

1. **Best**: `npm start` (web mode) ← **GUNAKAN INI!**
2. **OK**: Electron ULTRA_LOW
3. **Last Resort**: Electron EXTREME_LOW
4. **Don't**: Electron MEDIUM/HIGH

**Web mode is the way to go for PC without GPU!** 🚀

---

**Quick Start**:
```bash
# Just use this!
npm start
```

Open browser → http://localhost:8080 → Enjoy smooth performance! 🎉
