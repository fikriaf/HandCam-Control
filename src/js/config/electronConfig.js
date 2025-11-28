// Performance modes for Electron
export const PERFORMANCE_MODES = {
  // Extreme Low - untuk PC SANGAT lemah (last resort)
  EXTREME_LOW: {
    camera: {
      resolution: { width: 160, height: 120 },  // Sangat kecil
      fps: 5,  // Sangat rendah
      facingMode: 'user'
    },
    mediapipe: {
      modelPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      useOffline: false,
      offlineModelPath: './models/hand_landmarker.task',
      maxNumHands: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
      runningMode: 'VIDEO'
    },
    performance: {
      targetFPS: 5,
      maxCPUUsage: 95,
      enableThrottling: true,
      frameSkipThreshold: 300,
      historyBufferSize: 3
    },
    visualization: {
      enabled: false,  // Matikan semua visualization
      showLandmarks: false,
      showConnections: false,
      showLabels: false,
      showFPS: true,
      showBoundingBox: false,
      colors: {
        thumb: '#FF0000',
        index: '#0000FF',
        middle: '#00FF00',
        ring: '#FFFF00',
        pinky: '#FF00FF',
        palm: '#FFFFFF',
        connection: '#00FFFF'
      }
    },
    fallback: {
      noHandTimeout: 3000,
      retryAttempts: 2,
      retryDelay: 1500
    }
  },
  
  // Ultra Low - untuk PC sangat lemah atau tanpa GPU (CPU only)
  ULTRA_LOW: {
    camera: {
      resolution: { width: 320, height: 240 },
      fps: 10,  // Very low FPS for CPU only
      facingMode: 'user'
    },
    mediapipe: {
      modelPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      useOffline: false,
      offlineModelPath: './models/hand_landmarker.task',
      maxNumHands: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
      runningMode: 'VIDEO'
    },
    performance: {
      targetFPS: 10,  // Very low target
      maxCPUUsage: 90,
      enableThrottling: true,
      frameSkipThreshold: 150,  // Skip aggressively
      historyBufferSize: 5  // Minimal buffer
    },
    visualization: {
      enabled: true,
      showLandmarks: true,
      showConnections: false,  // Disable for performance
      showLabels: false,  // Disable for performance
      showFPS: true,
      showBoundingBox: false,
      colors: {
        thumb: '#FF0000',
        index: '#0000FF',
        middle: '#00FF00',
        ring: '#FFFF00',
        pinky: '#FF00FF',
        palm: '#FFFFFF',
        connection: '#00FFFF'
      }
    },
    fallback: {
      noHandTimeout: 2000,
      retryAttempts: 3,
      retryDelay: 1000
    }
  },
  
  // Low - untuk PC lemah
  LOW: {
    camera: {
      resolution: { width: 640, height: 480 },
      fps: 20
    },
    mediapipe: {
      maxNumHands: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    },
    performance: {
      targetFPS: 20,
      frameSkipThreshold: 60
    },
    visualization: {
      enabled: true,
      showLandmarks: true,
      showConnections: false,
      showLabels: true,
      showFPS: true,
      showBoundingBox: false
    }
  },
  
  // Medium - balanced (default untuk Electron)
  MEDIUM: {
    camera: {
      resolution: { width: 640, height: 480 },
      fps: 30
    },
    mediapipe: {
      maxNumHands: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    },
    performance: {
      targetFPS: 30,
      frameSkipThreshold: 40
    },
    visualization: {
      enabled: true,
      showLandmarks: true,
      showConnections: false,
      showLabels: true,
      showFPS: true,
      showBoundingBox: false
    }
  },
  
  // High - untuk PC dengan GPU bagus
  HIGH: {
    camera: {
      resolution: { width: 1280, height: 720 },
      fps: 30
    },
    mediapipe: {
      maxNumHands: 2,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    },
    performance: {
      targetFPS: 30,
      frameSkipThreshold: 33
    },
    visualization: {
      enabled: true,
      showLandmarks: true,
      showConnections: true,
      showLabels: true,
      showFPS: true,
      showBoundingBox: false
    }
  }
};

// Default: ULTRA_LOW untuk Electron (CPU only, no GPU)
// Ganti ke LOW, MEDIUM, atau HIGH jika PC Anda punya GPU bagus
export const electronOptimizedConfig = PERFORMANCE_MODES.ULTRA_LOW;

// Detect if running in Electron
export function isElectron() {
  return typeof window !== 'undefined' && 
         window.process && 
         window.process.type === 'renderer';
}

// Get optimized config based on environment
export function getOptimizedConfig() {
  if (isElectron()) {
    console.log('Running in Electron - Using optimized settings');
    return electronOptimizedConfig;
  }
  return null; // Use default config
}
