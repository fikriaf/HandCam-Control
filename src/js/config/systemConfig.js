// System configuration for camera, MediaPipe, and performance
export const systemConfig = {
  camera: {
    resolution: {
      width: 1280,
      height: 720
    },
    fps: 30,
    facingMode: 'user'  // 'user' for front camera, 'environment' for back
  },
  
  mediapipe: {
    modelPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
    useOffline: false,              // Set to true to use local model
    offlineModelPath: './models/hand_landmarker.task',
    maxNumHands: 2,                 // Maximum number of hands to detect
    minDetectionConfidence: 0.5,    // Minimum confidence for detection
    minTrackingConfidence: 0.5,     // Minimum confidence for tracking
    runningMode: 'VIDEO'            // 'VIDEO' or 'IMAGE'
  },
  
  performance: {
    targetFPS: 30,                  // Target frame rate
    maxCPUUsage: 80,                // Maximum CPU usage percentage
    enableThrottling: true,         // Auto-reduce FPS if CPU high
    frameSkipThreshold: 33,         // Skip frame if processing > 33ms
    historyBufferSize: 30           // Max frames to keep in history
  },
  
  visualization: {
    enabled: true,
    showLandmarks: true,
    showConnections: true,
    showLabels: true,
    showFPS: true,
    showBoundingBox: false,
    colors: {
      thumb: '#FF0000',      // Red
      index: '#0000FF',      // Blue
      middle: '#00FF00',     // Green
      ring: '#FFFF00',       // Yellow
      pinky: '#FF00FF',      // Purple
      palm: '#FFFFFF',       // White
      connection: '#00FFFF'  // Cyan
    }
  },
  
  fallback: {
    noHandTimeout: 2000,            // Milliseconds before entering idle mode
    retryAttempts: 3,               // Number of retry attempts on error
    retryDelay: 1000                // Milliseconds between retries
  }
};

// Validate and merge user config with defaults
export function validateSystemConfig(userConfig = {}) {
  const config = JSON.parse(JSON.stringify(systemConfig)); // Deep clone
  
  // Merge camera settings
  if (userConfig.camera) {
    config.camera = { ...config.camera, ...userConfig.camera };
    if (userConfig.camera.resolution) {
      config.camera.resolution = { ...config.camera.resolution, ...userConfig.camera.resolution };
    }
  }
  
  // Merge mediapipe settings
  if (userConfig.mediapipe) {
    config.mediapipe = { ...config.mediapipe, ...userConfig.mediapipe };
  }
  
  // Merge performance settings
  if (userConfig.performance) {
    config.performance = { ...config.performance, ...userConfig.performance };
  }
  
  // Merge visualization settings
  if (userConfig.visualization) {
    config.visualization = { ...config.visualization, ...userConfig.visualization };
    if (userConfig.visualization.colors) {
      config.visualization.colors = { ...config.visualization.colors, ...userConfig.visualization.colors };
    }
  }
  
  // Validate ranges
  if (config.camera.fps < 1) config.camera.fps = 30;
  if (config.mediapipe.maxNumHands < 1) config.mediapipe.maxNumHands = 2;
  if (config.performance.targetFPS < 1) config.performance.targetFPS = 30;
  
  return config;
}
