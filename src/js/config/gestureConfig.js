// Gesture configuration with thresholds and parameters
export const gestureConfig = {
  swipe: {
    enabled: true,
    velocityThreshold: 0.5,      // Minimum velocity in units/sec
    smoothingWindow: 5,           // Number of frames for moving average
    debounceMs: 300,              // Milliseconds between detections
    minDistance: 0.1              // Minimum distance to travel
  },
  
  pinch: {
    enabled: true,
    distanceThreshold: 0.05,      // Distance to activate pinch
    releaseThreshold: 0.08,       // Distance to release pinch
    smoothingAlpha: 0.3,          // EMA smoothing factor (0-1)
    debounceMs: 100,              // Milliseconds between pinch events
    volumeThreshold: 0.02         // Minimum movement for volume control
  },
  
  push: {
    enabled: true,
    depthThreshold: 0.15,         // Minimum depth change
    velocityThreshold: 0.3,       // Minimum velocity in units/sec
    debounceMs: 500,              // Milliseconds between detections
    smoothingWindow: 3            // Number of frames for smoothing
  },
  
  static: {
    enabled: true,
    holdDuration: 500,            // Milliseconds to hold gesture
    confidenceThreshold: 0.7,     // Minimum confidence score
    debounceMs: 1000,             // Milliseconds between detections
    fingerExtensionThreshold: 0.6 // Threshold for finger extended/bent
  }
};

// Validate and merge user config with defaults
export function validateConfig(userConfig = {}) {
  const config = JSON.parse(JSON.stringify(gestureConfig)); // Deep clone
  
  // Merge user config
  for (const [gesture, settings] of Object.entries(userConfig)) {
    if (config[gesture]) {
      config[gesture] = { ...config[gesture], ...settings };
    }
  }
  
  // Validate ranges
  if (config.swipe.velocityThreshold < 0) config.swipe.velocityThreshold = 0.5;
  if (config.pinch.smoothingAlpha < 0 || config.pinch.smoothingAlpha > 1) {
    config.pinch.smoothingAlpha = 0.3;
  }
  
  return config;
}
