# Design Document

## Overview

Sistem Hand Gesture Control adalah aplikasi web berbasis JavaScript yang menggunakan MediaPipe Hands untuk deteksi tangan real-time dan menerjemahkan gesture menjadi aksi kontrol komputer. Arsitektur dirancang dengan prinsip separation of concerns, modular, dan event-driven untuk memudahkan extensibility.

### Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Computer Vision**: MediaPipe Hands v0.4+ / MediaPipe Gesture Recognizer
- **Video Input**: WebRTC getUserMedia API
- **Desktop Packaging**: Electron v27+
- **Build Tools**: Webpack 5 (untuk bundling), npm scripts

### Key Design Principles

1. **Modularity**: Setiap komponen (detection, recognition, action) terpisah
2. **Event-Driven**: Gesture detection memicu custom events yang dapat di-subscribe
3. **Configuration-Based**: Gesture mapping dan parameters dapat diubah via config object
4. **Performance-First**: Optimasi untuk 30-60 FPS dengan lazy loading dan throttling
5. **Offline-Capable**: MediaPipe models dapat di-bundle atau di-cache

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ UI Controller│  │Config Manager│  │Action Handler│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Gesture Processing Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Gesture Engine│  │Event Emitter │  │Smoothing     │      │
│  │              │  │              │  │Filter        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Detection Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │MediaPipe     │  │Hand Tracker  │  │Landmark      │      │
│  │Hands         │  │              │  │Processor     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Input Layer                              │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │WebRTC Stream │  │Video Canvas  │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Module Structure


```
src/
├── index.html              # Main HTML entry point
├── styles/
│   └── main.css           # Minimal styling for UI
├── js/
│   ├── main.js            # Application entry point
│   ├── config/
│   │   ├── gestureConfig.js      # Gesture mappings & thresholds
│   │   └── systemConfig.js       # System settings (FPS, resolution)
│   ├── core/
│   │   ├── CameraManager.js      # WebRTC camera access
│   │   ├── MediaPipeManager.js   # MediaPipe initialization
│   │   └── EventBus.js           # Custom event system
│   ├── detection/
│   │   ├── HandDetector.js       # Hand detection wrapper
│   │   └── LandmarkProcessor.js  # Process 21 landmarks
│   ├── recognition/
│   │   ├── GestureEngine.js      # Main gesture recognition
│   │   ├── detectors/
│   │   │   ├── SwipeDetector.js
│   │   │   ├── PinchDetector.js
│   │   │   ├── PushDetector.js
│   │   │   └── StaticGestureDetector.js
│   │   └── filters/
│   │       ├── SmoothingFilter.js
│   │       └── ThresholdFilter.js
│   ├── actions/
│   │   ├── ActionHandler.js      # Maps gestures to actions
│   │   └── actionRegistry.js     # User-defined action functions
│   └── ui/
│       ├── VisualizationRenderer.js  # Draw landmarks & feedback
│       └── UIController.js           # UI controls & toggles
├── models/                # MediaPipe models (for offline)
│   └── hand_landmarker.task
└── electron/              # Electron wrapper (optional)
    ├── main.js
    ├── preload.js
    └── package.json
```

## Components and Interfaces

### 1. CameraManager

**Responsibility**: Mengelola akses webcam dan video stream

```javascript
class CameraManager {
  constructor(config)
  async initialize()
  async startStream()
  stopStream()
  getVideoElement()
  getStreamDimensions()
}
```

**Key Methods**:
- `initialize()`: Request camera permission dan setup video element
- `startStream()`: Mulai video stream dengan constraints (resolution, FPS)
- `stopStream()`: Hentikan stream dan release resources

### 2. MediaPipeManager

**Responsibility**: Initialize dan manage MediaPipe Hands/Gesture Recognizer

```javascript
class MediaPipeManager {
  constructor(config)
  async loadModel(modelPath, useOffline)
  async detectHands(videoFrame)
  getHandLandmarks()
  getHandedness()
  dispose()
}
```

**Key Methods**:
- `loadModel()`: Load MediaPipe model (online CDN atau offline bundle)
- `detectHands()`: Process video frame dan return hand landmarks
- `getHandedness()`: Return 'Left' atau 'Right' untuk setiap tangan

### 3. LandmarkProcessor

**Responsibility**: Process raw landmarks menjadi data yang lebih meaningful

```javascript
class LandmarkProcessor {
  constructor()
  normalizeLandmarks(landmarks, imageWidth, imageHeight)
  calculateDistance(point1, point2)
  calculateVelocity(currentLandmarks, previousLandmarks, deltaTime)
  getBoundingBox(landmarks)
  getFingerStates(landmarks)  // open/closed untuk setiap jari
}
```

**Key Methods**:
- `normalizeLandmarks()`: Normalize koordinat ke range 0-1
- `calculateVelocity()`: Hitung kecepatan gerakan tangan
- `getFingerStates()`: Deteksi jari mana yang terbuka/tertutup

### 4. GestureEngine

**Responsibility**: Koordinasi semua gesture detectors dan emit events

```javascript
class GestureEngine {
  constructor(eventBus, config)
  registerDetector(name, detectorInstance)
  processFrame(landmarks, handedness, timestamp)
  enableDetector(name)
  disableDetector(name)
}
```

**Key Methods**:
- `registerDetector()`: Register custom gesture detector
- `processFrame()`: Run semua active detectors dan emit events
- `enableDetector()`/`disableDetector()`: Toggle specific detectors

### 5. Gesture Detectors

**Base Interface**:
```javascript
class BaseGestureDetector {
  constructor(config)
  detect(landmarks, previousLandmarks, deltaTime, handedness)
  reset()
  getState()
}
```

**Implementations**:

#### SwipeDetector

```javascript
class SwipeDetector extends BaseGestureDetector {
  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    // Calculate wrist velocity
    // Check if velocity exceeds threshold
    // Determine direction (left/right/up/down)
    // Apply smoothing filter
    // Return { detected: true, direction: 'left', velocity: 0.8 }
  }
}
```

**Detection Logic**:
1. Track wrist landmark (index 0) position
2. Calculate velocity vector dari previous frame
3. Apply smoothing dengan moving average (window size 5)
4. Check velocity magnitude > threshold (0.5 unit/sec)
5. Determine direction berdasarkan dominant axis
6. Emit event dengan debouncing 300ms

#### PinchDetector

```javascript
class PinchDetector extends BaseGestureDetector {
  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    // Calculate distance between thumb tip (4) and index tip (8)
    // Apply exponential moving average
    // Check if distance < pinch threshold (0.05)
    // Track pinch state (idle/active/released)
    // Return { detected: true, state: 'active', distance: 0.03 }
  }
}
```

**Detection Logic**:
1. Calculate Euclidean distance antara landmark 4 (thumb tip) dan 8 (index tip)
2. Apply EMA smoothing: `smoothed = alpha * current + (1-alpha) * previous`
3. State machine: idle → active (distance < 0.05) → released (distance > 0.08)
4. Saat active, track movement untuk drag atau volume control
5. Emit onPinchStart, onPinchMove, onPinchEnd events

#### PushDetector

```javascript
class PushDetector extends BaseGestureDetector {
  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    // Calculate bounding box size change
    // Estimate z-depth from box size
    // Check if z-velocity > threshold
    // Return { detected: true, depth: 0.2, velocity: 0.4 }
  }
}
```

**Detection Logic**:
1. Calculate bounding box area dari landmarks
2. Compare dengan previous frame untuk estimate depth change
3. Larger box = closer to camera (z increases)
4. Check z-velocity > 0.3 unit/sec
5. Debounce 500ms untuk prevent multiple triggers

#### StaticGestureDetector

```javascript
class StaticGestureDetector extends BaseGestureDetector {
  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    // Use MediaPipe Gesture Recognizer
    // Or implement custom logic:
    // - OK: thumb-index circle, other fingers extended
    // - Peace: index+middle extended, others closed
    // - Open Palm: all fingers extended and separated
    // Check gesture stability (hold duration)
    // Return { detected: true, gesture: 'ok', confidence: 0.85 }
  }
}
```

**Detection Logic**:
1. Calculate finger states (extended/bent) untuk setiap jari
2. Pattern matching untuk specific gestures:
   - OK: thumb-index distance < 0.06, middle/ring/pinky extended
   - Peace: index & middle extended, thumb/ring/pinky bent
   - Open Palm: all fingers extended, finger spread > 0.1
3. Check gesture stability: same gesture for 500ms
4. Use confidence threshold 0.7
5. Debounce 1000ms after detection

### 6. Smoothing & Threshold Filters

#### SmoothingFilter

```javascript
class SmoothingFilter {
  constructor(windowSize = 5)
  addSample(value)
  getSmoothed()
  reset()
}
```

**Implementations**:
- **Moving Average**: Simple average dari N frames terakhir
- **Exponential Moving Average**: `EMA = alpha * current + (1-alpha) * previous`
- **Kalman Filter**: (Optional) untuk smoothing yang lebih advanced

#### ThresholdFilter

```javascript
class ThresholdFilter {
  constructor(thresholds)
  checkVelocity(velocity)
  checkDistance(distance)
  checkDuration(duration)
}
```

### 7. EventBus

**Responsibility**: Custom event system untuk gesture events

```javascript
class EventBus {
  on(eventName, callback)
  off(eventName, callback)
  emit(eventName, data)
  once(eventName, callback)
}
```

**Event Types**:
- `gesture:swipe:left`, `gesture:swipe:right`, `gesture:swipe:up`, `gesture:swipe:down`
- `gesture:push:forward`
- `gesture:pinch:start`, `gesture:pinch:move`, `gesture:pinch:end`
- `gesture:pinch:volume`
- `gesture:static:ok`, `gesture:static:peace`, `gesture:static:openpalm`
- `hand:detected`, `hand:lost`
- `system:fps`, `system:error`

### 8. ActionHandler

**Responsibility**: Map gesture events ke user-defined actions

```javascript
class ActionHandler {
  constructor(eventBus, actionRegistry)
  registerAction(gestureName, actionFunction)
  unregisterAction(gestureName)
  executeAction(gestureName, data)
}
```

**Usage Example**:
```javascript
actionHandler.registerAction('swipe:left', () => {
  console.log('Next slide');
  // User implementation here
});
```

### 9. VisualizationRenderer

**Responsibility**: Render visual feedback pada canvas overlay

```javascript
class VisualizationRenderer {
  constructor(canvas, config)
  drawLandmarks(landmarks, handedness)
  drawConnections(landmarks)
  drawGestureLabel(gestureName, confidence, position)
  drawBoundingBox(landmarks)
  clear()
  setVisible(visible)
}
```

**Rendering Details**:
- Landmarks: Colored circles (5px radius)
  - Thumb: Red
  - Index: Blue
  - Middle: Green
  - Ring: Yellow
  - Pinky: Purple
  - Palm: White
- Connections: Lines between landmarks (2px width)
- Gesture label: Text dengan background semi-transparent
- FPS counter: Top-right corner

## Data Models

### Landmark Data Structure

```javascript
{
  x: 0.5,        // Normalized x (0-1)
  y: 0.3,        // Normalized y (0-1)
  z: -0.1,       // Relative depth
  visibility: 0.95  // Confidence (0-1)
}
```

### Hand Data Structure

```javascript
{
  handedness: 'Left' | 'Right',
  landmarks: Landmark[21],  // Array of 21 landmarks
  worldLandmarks: Landmark[21],  // 3D coordinates in meters
  timestamp: 1234567890
}
```

### Gesture Event Data

```javascript
{
  type: 'swipe' | 'pinch' | 'push' | 'static',
  name: 'swipe:left',
  handedness: 'Right',
  confidence: 0.85,
  data: {
    // Gesture-specific data
    direction: 'left',
    velocity: 0.8,
    position: { x: 0.5, y: 0.3 }
  },
  timestamp: 1234567890
}
```

### Configuration Schema

```javascript
{
  camera: {
    resolution: { width: 1280, height: 720 },
    fps: 30,
    facingMode: 'user'
  },
  mediapipe: {
    modelPath: './models/hand_landmarker.task',
    useOffline: false,
    maxNumHands: 2,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  },
  gestures: {
    swipe: {
      enabled: true,
      velocityThreshold: 0.5,
      smoothingWindow: 5,
      debounceMs: 300
    },
    pinch: {
      enabled: true,
      distanceThreshold: 0.05,
      releaseThreshold: 0.08,
      smoothingAlpha: 0.3
    },
    push: {
      enabled: true,
      depthThreshold: 0.15,
      velocityThreshold: 0.3,
      debounceMs: 500
    },
    static: {
      enabled: true,
      holdDuration: 500,
      confidenceThreshold: 0.7,
      debounceMs: 1000
    }
  },
  performance: {
    targetFPS: 30,
    maxCPUUsage: 80,
    enableThrottling: true
  },
  visualization: {
    enabled: true,
    showLandmarks: true,
    showConnections: true,
    showLabels: true,
    showFPS: true
  }
}
```

## Error Handling

### Error Types

1. **Camera Access Error**
   - User denied permission
   - No camera available
   - Camera in use by another app
   - **Handling**: Show error message, provide retry button

2. **MediaPipe Loading Error**
   - Model file not found
   - Network error (online mode)
   - Incompatible browser
   - **Handling**: Fallback to offline model, show error message

3. **Performance Degradation**
   - FPS drops below 20
   - CPU usage > 80%
   - **Handling**: Auto-reduce resolution, disable visualization

4. **Detection Errors**
   - No hands detected for extended period
   - Ambiguous gesture detection
   - **Handling**: Enter fallback mode, show visual feedback

### Error Recovery Strategy

```javascript
class ErrorHandler {
  handleCameraError(error) {
    if (error.name === 'NotAllowedError') {
      // Show permission request UI
    } else if (error.name === 'NotFoundError') {
      // Show "no camera" message
    }
  }
  
  handleModelLoadError(error) {
    // Try offline model
    // If fails, show error and disable system
  }
  
  handlePerformanceIssue() {
    // Reduce resolution
    // Lower FPS
    // Disable visualization
  }
}
```

## Testing Strategy

### Unit Tests

**Target Coverage**: 80%+

**Test Files**:
- `LandmarkProcessor.test.js`: Test distance, velocity calculations
- `SmoothingFilter.test.js`: Test moving average, EMA
- `SwipeDetector.test.js`: Test swipe detection logic
- `PinchDetector.test.js`: Test pinch state machine
- `EventBus.test.js`: Test event emission and subscription

**Testing Framework**: Jest

### Integration Tests

**Scenarios**:
1. Camera initialization → MediaPipe loading → Hand detection
2. Gesture detection → Event emission → Action execution
3. Configuration changes → System reconfiguration
4. Error scenarios → Error handling → Recovery

### Performance Tests

**Metrics**:
- FPS measurement (target: 30-60)
- Memory usage (target: < 500MB)
- CPU usage (target: < 60%)
- Latency (gesture detection to action: < 100ms)

**Tools**: Chrome DevTools Performance profiler

### Manual Testing Checklist

- [ ] All 10 gestures detected correctly
- [ ] Left and right hand detection works
- [ ] Smoothing reduces jitter
- [ ] Threshold prevents false positives
- [ ] Visual feedback displays correctly
- [ ] Offline mode works
- [ ] Electron app builds and runs
- [ ] Configuration changes apply correctly

## Performance Optimization

### 1. Frame Processing Optimization

**Strategy**:
- Use `requestAnimationFrame` untuk sync dengan browser refresh
- Skip frames jika processing time > frame budget (33ms untuk 30fps)
- Use Web Workers untuk offload heavy computation (future enhancement)

```javascript
class FrameProcessor {
  constructor(targetFPS) {
    this.frameInterval = 1000 / targetFPS;
    this.lastFrameTime = 0;
  }
  
  shouldProcessFrame(currentTime) {
    if (currentTime - this.lastFrameTime >= this.frameInterval) {
      this.lastFrameTime = currentTime;
      return true;
    }
    return false;
  }
}
```

### 2. MediaPipe Optimization

**Settings**:
- `maxNumHands: 2` (hanya detect 2 tangan max)
- `minDetectionConfidence: 0.5` (balance accuracy vs speed)
- `minTrackingConfidence: 0.5`
- Use `runningMode: 'VIDEO'` untuk better performance

### 3. Canvas Rendering Optimization

**Techniques**:
- Use `OffscreenCanvas` untuk rendering di background (jika supported)
- Batch draw calls
- Only redraw when landmarks change
- Use `willReadFrequently: false` untuk canvas context

### 4. Memory Management

**Practices**:
- Reuse objects instead of creating new ones
- Clear arrays after processing
- Dispose MediaPipe resources properly
- Limit history buffer size (max 30 frames)

### 5. Lazy Loading

**Implementation**:
- Load MediaPipe model only when needed
- Defer loading of unused gesture detectors
- Load Electron dependencies only in desktop mode

## Offline Mode Implementation

### Model Bundling

**Steps**:
1. Download MediaPipe hand_landmarker.task (9MB)
2. Place in `src/models/` directory
3. Configure webpack to bundle as asset
4. Update MediaPipeManager to use local path

```javascript
const modelPath = config.useOffline 
  ? './models/hand_landmarker.task'
  : 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
```

### Service Worker (Optional)

**Purpose**: Cache assets untuk offline access

```javascript
// sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('gesture-control-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/js/main.js',
        '/models/hand_landmarker.task'
      ]);
    })
  );
});
```

## Electron Integration

### Project Structure

```
electron/
├── main.js           # Electron main process
├── preload.js        # Preload script for IPC
└── package.json      # Electron-specific config
```

### main.js Implementation

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  win.loadFile('../src/index.html');
}

app.whenReady().then(createWindow);
```

### Build Configuration

**electron-builder config**:
```json
{
  "build": {
    "appId": "com.gesturecontrol.app",
    "productName": "Hand Gesture Control",
    "files": [
      "src/**/*",
      "electron/**/*",
      "models/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png"
    }
  }
}
```

### Build Scripts

```json
{
  "scripts": {
    "start": "electron electron/main.js",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux",
    "build:all": "electron-builder -mwl"
  }
}
```

## Deployment Considerations

### Web Deployment

**Requirements**:
- HTTPS (required untuk getUserMedia)
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- CORS headers untuk MediaPipe CDN

### Desktop Deployment

**Package Size Optimization**:
- Use asar archive untuk compress files
- Exclude dev dependencies
- Use electron-builder compression

**Auto-update** (Optional):
- Integrate electron-updater
- Setup update server
- Implement update notification UI

## Security Considerations

1. **Camera Privacy**
   - Request permission explicitly
   - Show indicator when camera is active
   - Provide easy way to disable camera

2. **Data Privacy**
   - All processing happens locally (no data sent to server)
   - No recording or storage of video frames
   - Clear privacy policy in UI

3. **Content Security Policy**
   - Restrict script sources
   - Disable eval()
   - Use nonce for inline scripts

## Future Enhancements

1. **Multi-hand Gestures**: Gestures yang require 2 tangan
2. **Custom Gesture Training**: Allow users to train custom gestures
3. **Gesture Macros**: Chain multiple gestures untuk complex actions
4. **Voice Commands**: Combine dengan speech recognition
5. **Mobile Support**: Adapt untuk mobile browsers
6. **VR/AR Integration**: Use dengan WebXR API

## Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "@mediapipe/tasks-vision": "^0.10.8"
  },
  "devDependencies": {
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "electron": "^27.0.0",
    "electron-builder": "^24.6.4",
    "jest": "^29.7.0"
  }
}
```

### CDN Links (Online Mode)

- MediaPipe Tasks Vision: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8`
- MediaPipe Model: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`

## Documentation for Adding New Gestures

### Step-by-Step Guide

1. **Create Detector Class**
   ```javascript
   // src/js/recognition/detectors/MyGestureDetector.js
   class MyGestureDetector extends BaseGestureDetector {
     detect(landmarks, previousLandmarks, deltaTime, handedness) {
       // Implement detection logic
       return { detected: true, data: {...} };
     }
   }
   ```

2. **Register in GestureEngine**
   ```javascript
   // src/js/main.js
   const myDetector = new MyGestureDetector(config.gestures.mygesture);
   gestureEngine.registerDetector('mygesture', myDetector);
   ```

3. **Add Configuration**
   ```javascript
   // src/js/config/gestureConfig.js
   mygesture: {
     enabled: true,
     threshold: 0.5,
     debounceMs: 300
   }
   ```

4. **Register Action Handler**
   ```javascript
   // src/js/actions/actionRegistry.js
   actionHandler.registerAction('mygesture', (data) => {
     console.log('My gesture detected!', data);
     // Your action here
   });
   ```

### Example: Thumbs Up Gesture

```javascript
class ThumbsUpDetector extends BaseGestureDetector {
  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    // Thumb tip (4) should be above thumb IP (3)
    const thumbUp = landmarks[4].y < landmarks[3].y;
    
    // Other fingers should be closed (tips below PIPs)
    const fingersClosed = 
      landmarks[8].y > landmarks[6].y &&  // Index
      landmarks[12].y > landmarks[10].y && // Middle
      landmarks[16].y > landmarks[14].y && // Ring
      landmarks[20].y > landmarks[18].y;   // Pinky
    
    if (thumbUp && fingersClosed) {
      return { detected: true, confidence: 0.9 };
    }
    
    return { detected: false };
  }
}
```

## Summary

Design ini menyediakan arsitektur yang modular, scalable, dan performance-optimized untuk sistem hand gesture control. Setiap komponen memiliki tanggung jawab yang jelas dan dapat di-extend dengan mudah. Sistem mendukung offline mode, Electron packaging, dan customizable gesture mappings sesuai requirements.
