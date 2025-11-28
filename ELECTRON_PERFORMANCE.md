# Electron Performance Optimization Guide

Tips untuk meningkatkan performa Electron app agar tidak lag.

## 🚀 Quick Fixes (Sudah Diterapkan)

Optimasi berikut sudah otomatis aktif di Electron:

✅ **Lower Resolution**: 640x480 (vs 1280x720 di web)
✅ **Single Hand Detection**: Hanya 1 tangan (vs 2 di web)
✅ **Disabled Connections**: Tidak render skeleton lines
✅ **Adaptive Frame Skipping**: Skip frame jika processing lambat
✅ **GPU Disabled**: Menghindari GPU crash
✅ **Smaller Buffer**: History buffer lebih kecil

## 🎯 Manual Optimizations

### 1. Disable Visualization (Paling Efektif!)

Klik tombol **"Toggle Visualization"** untuk mematikan overlay.

Atau edit `src/js/config/electronConfig.js`:
```javascript
visualization: {
  enabled: false  // Matikan semua visualization
}
```

**Impact**: +10-15 FPS

### 2. Lower Camera Resolution

Edit `src/js/config/electronConfig.js`:
```javascript
camera: {
  resolution: {
    width: 320,   // Sangat rendah tapi cepat
    height: 240
  }
}
```

**Impact**: +5-10 FPS

### 3. Reduce Target FPS

```javascript
performance: {
  targetFPS: 20  // Lower = less CPU
}
```

**Impact**: Lebih smooth, less CPU

### 4. Increase Detection Confidence

```javascript
mediapipe: {
  minDetectionConfidence: 0.7,  // Higher = less processing
  minTrackingConfidence: 0.7
}
```

**Impact**: +2-5 FPS, tapi kurang sensitif

### 5. Disable Specific Gestures

Edit `src/js/config/gestureConfig.js`:
```javascript
// Disable gestures yang tidak dipakai
pinch: {
  enabled: false
},
push: {
  enabled: false
}
```

**Impact**: +1-3 FPS per gesture

## 📊 Performance Comparison

| Setting | Web Mode | Electron Default | Electron Optimized |
|---------|----------|------------------|-------------------|
| Resolution | 1280x720 | 640x480 | 320x240 |
| Max Hands | 2 | 1 | 1 |
| Connections | Yes | No | No |
| Target FPS | 30 | 30 | 20 |
| Expected FPS | 30-60 | 20-30 | 25-40 |

## 🔧 Advanced Optimizations

### 1. Use Offline Model

Download model untuk menghindari network latency:

```bash
# Download model
curl -o src/models/hand_landmarker.task https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task