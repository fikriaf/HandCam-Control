// MediaPipe manager for hand detection
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export class MediaPipeManager {
  constructor(config) {
    this.config = config;
    this.handLandmarker = null;
    this.lastResults = null;
    this.isInitialized = false;
  }

  /**
   * Load MediaPipe model
   * @returns {Promise<void>}
   */
  async loadModel() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize vision tasks
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
      );

      // Determine model path
      const modelPath = this.config.useOffline 
        ? this.config.offlineModelPath 
        : this.config.modelPath;

      // Create hand landmarker
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: modelPath,
          delegate: 'GPU'
        },
        runningMode: this.config.runningMode.toLowerCase(),
        numHands: this.config.maxNumHands,
        minHandDetectionConfidence: this.config.minDetectionConfidence,
        minHandPresenceConfidence: this.config.minTrackingConfidence,
        minTrackingConfidence: this.config.minTrackingConfidence
      });

      this.isInitialized = true;
      console.log('MediaPipe Hand Landmarker loaded successfully');
      
    } catch (error) {
      console.error('Error loading MediaPipe model:', error);
      
      // Try offline model if online fails
      if (!this.config.useOffline) {
        console.log('Attempting to load offline model...');
        this.config.useOffline = true;
        return this.loadModel();
      }
      
      throw new Error(`Failed to load MediaPipe model: ${error.message}`);
    }
  }

  /**
   * Detect hands in video frame
   * @param {HTMLVideoElement} videoElement - Video element to process
   * @param {number} timestamp - Current timestamp in milliseconds
   * @returns {Object} Detection results
   */
  detectHands(videoElement, timestamp) {
    if (!this.isInitialized || !this.handLandmarker) {
      throw new Error('MediaPipe not initialized. Call loadModel() first.');
    }

    try {
      // Detect hands for video mode
      if (this.config.runningMode.toLowerCase() === 'video') {
        this.lastResults = this.handLandmarker.detectForVideo(videoElement, timestamp);
      } else {
        this.lastResults = this.handLandmarker.detect(videoElement);
      }

      return this.lastResults;
      
    } catch (error) {
      console.error('Error detecting hands:', error);
      return null;
    }
  }

  /**
   * Get hand landmarks from last detection
   * @returns {Array} Array of hand landmarks
   */
  getHandLandmarks() {
    if (!this.lastResults || !this.lastResults.landmarks) {
      return [];
    }
    return this.lastResults.landmarks;
  }

  /**
   * Get handedness (Left/Right) from last detection
   * @returns {Array} Array of handedness info
   */
  getHandedness() {
    if (!this.lastResults || !this.lastResults.handednesses) {
      return [];
    }
    return this.lastResults.handednesses;
  }

  /**
   * Get world landmarks (3D coordinates in meters)
   * @returns {Array} Array of world landmarks
   */
  getWorldLandmarks() {
    if (!this.lastResults || !this.lastResults.worldLandmarks) {
      return [];
    }
    return this.lastResults.worldLandmarks;
  }

  /**
   * Get last detection results
   * @returns {Object} Last results object
   */
  getLastResults() {
    return this.lastResults;
  }

  /**
   * Check if hands are detected
   * @returns {boolean}
   */
  hasHands() {
    return this.lastResults && 
           this.lastResults.landmarks && 
           this.lastResults.landmarks.length > 0;
  }

  /**
   * Get number of detected hands
   * @returns {number}
   */
  getHandCount() {
    if (!this.lastResults || !this.lastResults.landmarks) {
      return 0;
    }
    return this.lastResults.landmarks.length;
  }

  /**
   * Dispose and cleanup resources
   */
  dispose() {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
    this.lastResults = null;
    this.isInitialized = false;
  }

  /**
   * Check if MediaPipe is initialized
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized && this.handLandmarker !== null;
  }
}
