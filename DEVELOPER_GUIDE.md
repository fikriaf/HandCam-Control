# Developer Guide

Complete guide for developers to extend and customize the Hand Gesture Control System.

## Architecture Overview

The system follows a modular, event-driven architecture with clear separation of concerns:

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

## Core Components

### 1. EventBus (`src/js/core/EventBus.js`)

Central event system for communication between modules.

**Key Methods**:
- `on(eventName, callback)`: Subscribe to events
- `emit(eventName, data)`: Emit events
- `off(eventName, callback)`: Unsubscribe
- `once(eventName, callback)`: Subscribe once

**Usage**:
```javascript
const eventBus = new EventBus();

// Subscribe
eventBus.on('gesture:swipe:left', (data) => {
  console.log('Swipe left detected:', data);
});

// Emit
eventBus.emit('gesture:swipe:left', { velocity: 0.8 });
```

### 2. LandmarkProcessor (`src/js/detection/LandmarkProcessor.js`)

Processes raw MediaPipe landmarks into meaningful data.

**Key Methods**:
- `calculateDistance(point1, point2)`: Euclidean distance
- `calculateVelocity(current, previous, deltaTime)`: Movement velocity
- `getBoundingBox(landmarks)`: Hand bounding box
- `getFingerStates(landmarks)`: Which fingers are extended

### 3. GestureEngine (`src/js/recognition/GestureEngine.js`)

Coordinates all gesture detectors and manages detection flow.

**Key Methods**:
- `registerDetector(name, detector)`: Add new detector
- `processFrame(handData)`: Process hand data
- `enableDetector(name)` / `disableDetector(name)`: Toggle detectors

## Adding New Gestures

### Step 1: Create Detector Class

Create a new file in `src/js/recognition/detectors/`:

```javascript
// src/js/recognition/detectors/ThumbsUpDetector.js
import { BaseGestureDetector } from './BaseGestureDetector.js';

export class ThumbsUpDetector extends BaseGestureDetector {
  constructor(config, landmarkProcessor) {
    super(config);
    this.landmarkProcessor = landmarkProcessor;
  }

  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    if (!this.isEnabled() || !landmarks || landmarks.length < 21) {
      return null;
    }

    // Get finger states
    const fingerStates = this.landmarkProcessor.getFingerStates(landmarks);

    // Thumb should be extended and pointing up
    const thumbUp = landmarks[4].y < landmarks[3].y;
    
    // Other fingers should be closed
    const fingersClosed = 
      !fingerStates.index &&
      !fingerStates.middle &&
      !fingerStates.ring &&
      !fingerStates.pinky;

    if (thumbUp && fingersClosed) {
      // Check debouncing
      if (!this.canDetect()) {
        return null;
      }

      this.markDetection();

      return {
        detected: true,
        type: 'static',
        gesture: 'thumbsup',
        confidence: 0.9,
        handedness,
        timestamp: performance.now()
      };
    }

    return null;
  }
}
```

### Step 2: Add Configuration

Edit `src/js/config/gestureConfig.js`:

```javascript
export const gestureConfig = {
  // ... existing config
  
  thumbsup: {
    enabled: true,
    holdDuration: 500,
    confidenceThreshold: 0.7,
    debounceMs: 1000
  }
};
```

### Step 3: Register Detector

Edit `src/js/main.js` in the `initializeGestureDetectors()` method:

```javascript
import { ThumbsUpDetector } from './recognition/detectors/ThumbsUpDetector.js';

initializeGestureDetectors() {
  // ... existing detectors
  
  // Thumbs up detector
  const thumbsUpDetector = new ThumbsUpDetector(
    this.gestureConfig.thumbsup,
    this.landmarkProcessor
  );
  this.gestureEngine.registerDetector('thumbsup', thumbsUpDetector);
}
```

### Step 4: Add Action Handler

Edit `src/js/actions/actionRegistry.js`:

```javascript
export function onThumbsUpGesture(data) {
  console.log('Thumbs up detected:', data);
  logToUI(`Thumbs Up → Like! (${data.handedness} hand)`, 'gesture');
  
  // Your custom action
  // Example: Send "like" to server
}

export const actionRegistry = {
  // ... existing actions
  'static:thumbsup': onThumbsUpGesture
};
```

### Step 5: Update ActionHandler

Edit `src/js/actions/ActionHandler.js` in `subscribeToGestureEvents()`:

```javascript
subscribeToGestureEvents() {
  // ... existing subscriptions
  
  this.eventBus.on('gesture:static:thumbsup', (data) => 
    this.executeAction('static:thumbsup', data)
  );
}
```

## Example Implementations

### Example 1: Fist Gesture

```javascript
export class FistDetector extends BaseGestureDetector {
  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    if (!this.isEnabled() || !landmarks) return null;

    const fingerStates = this.landmarkProcessor.getFingerStates(landmarks);

    // All fingers should be closed
    const allClosed = !fingerStates.thumb &&
                     !fingerStates.index &&
                     !fingerStates.middle &&
                     !fingerStates.ring &&
                     !fingerStates.pinky;

    if (allClosed && this.canDetect()) {
      this.markDetection();
      return {
        detected: true,
        type: 'static',
        gesture: 'fist',
        confidence: 0.85,
        handedness,
        timestamp: performance.now()
      };
    }

    return null;
  }
}
```

### Example 2: Pointing Finger Gesture

```javascript
export class PointingDetector extends BaseGestureDetector {
  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    if (!this.isEnabled() || !landmarks) return null;

    const fingerStates = this.landmarkProcessor.getFingerStates(landmarks);

    // Only index finger extended
    const pointing = fingerStates.index &&
                    !fingerStates.middle &&
                    !fingerStates.ring &&
                    !fingerStates.pinky;

    if (pointing && this.canDetect()) {
      // Get pointing direction
      const indexTip = landmarks[8];
      const wrist = landmarks[0];
      
      const direction = {
        x: indexTip.x - wrist.x,
        y: indexTip.y - wrist.y
      };

      this.markDetection();
      return {
        detected: true,
        type: 'static',
        gesture: 'pointing',
        direction,
        confidence: 0.9,
        handedness,
        timestamp: performance.now()
      };
    }

    return null;
  }
}
```

### Example 3: Rotation Gesture

```javascript
export class RotationDetector extends BaseGestureDetector {
  constructor(config, landmarkProcessor) {
    super(config);
    this.landmarkProcessor = landmarkProcessor;
    this.previousAngle = null;
    this.rotationAccumulator = 0;
  }

  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    if (!this.isEnabled() || !landmarks || !previousLandmarks) return null;

    // Calculate angle between index and pinky
    const index = landmarks[8];
    const pinky = landmarks[20];
    const wrist = landmarks[0];

    const angle = this.landmarkProcessor.calculateAngle(index, wrist, pinky);

    if (this.previousAngle !== null) {
      const angleDelta = angle - this.previousAngle;
      this.rotationAccumulator += angleDelta;

      // Detect full rotation (360 degrees)
      if (Math.abs(this.rotationAccumulator) > 180 && this.canDetect()) {
        const direction = this.rotationAccumulator > 0 ? 'clockwise' : 'counterclockwise';
        
        this.markDetection();
        this.rotationAccumulator = 0;

        return {
          detected: true,
          type: 'rotation',
          direction,
          angle: Math.abs(this.rotationAccumulator),
          handedness,
          timestamp: performance.now()
        };
      }
    }

    this.previousAngle = angle;
    return null;
  }

  reset() {
    super.reset();
    this.previousAngle = null;
    this.rotationAccumulator = 0;
  }
}
```

## Configuration Reference

### Gesture Configuration

```javascript
{
  enabled: true,              // Enable/disable detector
  velocityThreshold: 0.5,     // Minimum velocity (units/sec)
  distanceThreshold: 0.05,    // Minimum distance (normalized)
  holdDuration: 500,          // Hold time (milliseconds)
  confidenceThreshold: 0.7,   // Minimum confidence (0-1)
  debounceMs: 300,           // Debounce period (milliseconds)
  smoothingWindow: 5,         // Smoothing window size (frames)
  smoothingAlpha: 0.3        // EMA smoothing factor (0-1)
}
```

### System Configuration

```javascript
{
  camera: {
    resolution: { width: 1280, height: 720 },
    fps: 30,
    facingMode: 'user'
  },
  mediapipe: {
    useOffline: false,
    maxNumHands: 2,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  },
  performance: {
    targetFPS: 30,
    maxCPUUsage: 80,
    enableThrottling: true
  }
}
```

## API Reference

### BaseGestureDetector

Base class for all gesture detectors.

**Methods**:
- `detect(landmarks, previousLandmarks, deltaTime, handedness)`: Main detection method
- `reset()`: Reset detector state
- `canDetect()`: Check if debounce period passed
- `markDetection()`: Mark detection time
- `isEnabled()`: Check if detector is enabled

### LandmarkProcessor

**Methods**:
- `calculateDistance(point1, point2, use3D)`: Calculate distance between points
- `calculateVelocity(current, previous, deltaTime)`: Calculate velocity
- `getBoundingBox(landmarks)`: Get bounding box
- `getFingerStates(landmarks)`: Get finger extension states
- `getCenterPoint(landmarks)`: Get hand center
- `calculateAngle(point1, point2, point3)`: Calculate angle
- `areFingersSpread(landmarks)`: Check if fingers are spread

### SmoothingFilter

**Classes**:
- `MovingAverageFilter(windowSize)`: Simple moving average
- `ExponentialMovingAverageFilter(alpha)`: Exponential moving average
- `OneEuroFilter(minCutoff, beta, dCutoff)`: Advanced adaptive filter

**Methods**:
- `addSample(value)`: Add new sample
- `getSmoothed()`: Get smoothed value
- `reset()`: Reset filter

## Performance Optimization Tips

### 1. Reduce Processing Load

```javascript
// Skip frames if processing is slow
if (processingTime > framebudget) {
  skipFrame = true;
}

// Reduce resolution
systemConfig.camera.resolution = { width: 640, height: 480 };

// Limit hand detection
systemConfig.mediapipe.maxNumHands = 1;
```

### 2. Optimize Detector Logic

```javascript
// Early returns
if (!this.isEnabled()) return null;
if (!landmarks || landmarks.length < 21) return null;

// Cache calculations
const fingerStates = this.landmarkProcessor.getFingerStates(landmarks);

// Use debouncing
if (!this.canDetect()) return null;
```

### 3. Use Efficient Smoothing

```javascript
// EMA is faster than moving average
const filter = new ExponentialMovingAverageFilter(0.3);

// Reduce smoothing window
smoothingWindow: 3  // Instead of 5
```

## Testing

### Unit Testing

```javascript
// Example test for ThumbsUpDetector
import { ThumbsUpDetector } from './ThumbsUpDetector.js';

describe('ThumbsUpDetector', () => {
  let detector;
  let mockLandmarkProcessor;

  beforeEach(() => {
    mockLandmarkProcessor = {
      getFingerStates: jest.fn()
    };
    detector = new ThumbsUpDetector({}, mockLandmarkProcessor);
  });

  test('detects thumbs up gesture', () => {
    const landmarks = createMockLandmarks();
    mockLandmarkProcessor.getFingerStates.mockReturnValue({
      thumb: true,
      index: false,
      middle: false,
      ring: false,
      pinky: false
    });

    const result = detector.detect(landmarks, null, 0.016, 'Right');
    
    expect(result).not.toBeNull();
    expect(result.gesture).toBe('thumbsup');
  });
});
```

## Debugging

### Enable Verbose Logging

```javascript
// In main.js
console.log('Hand data:', handData);
console.log('Gesture detected:', result);
console.log('Processing time:', processingTime);
```

### Visualization Debugging

```javascript
// Enable all visualization options
systemConfig.visualization = {
  enabled: true,
  showLandmarks: true,
  showConnections: true,
  showLabels: true,
  showFPS: true,
  showBoundingBox: true
};
```

### Performance Profiling

```javascript
// Track processing times
const startTime = performance.now();
// ... processing code
const endTime = performance.now();
console.log(`Processing took ${endTime - startTime}ms`);
```

## Best Practices

1. **Always extend BaseGestureDetector** for consistency
2. **Use debouncing** to prevent multiple triggers
3. **Implement reset()** to clean up state
4. **Add configuration options** for flexibility
5. **Test with different lighting** conditions
6. **Document your gestures** in GESTURE_GUIDE.md
7. **Use meaningful event names** following the pattern `gesture:type:name`
8. **Handle edge cases** (null landmarks, missing data)
9. **Optimize for performance** (early returns, caching)
10. **Provide user feedback** through visualization

## Contributing

When contributing new gestures:

1. Follow the existing code style
2. Add comprehensive documentation
3. Include configuration options
4. Write unit tests
5. Update GESTURE_GUIDE.md
6. Test on multiple devices
7. Consider accessibility

## Support

For development questions:
- Check existing detector implementations
- Review the architecture diagram
- Open an issue on GitHub
- Join our developer community

## Resources

- [MediaPipe Hands Documentation](https://mediapipe.dev/solutions/hands)
- [WebRTC API Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Electron Documentation](https://www.electronjs.org/docs)
