// Push forward gesture detector
import { BaseGestureDetector } from './BaseGestureDetector.js';
import { MovingAverageFilter } from '../filters/SmoothingFilter.js';

export class PushDetector extends BaseGestureDetector {
  constructor(config, landmarkProcessor) {
    super(config);
    this.landmarkProcessor = landmarkProcessor;
    
    // Smoothing filter for depth
    this.depthFilter = new MovingAverageFilter(config.smoothingWindow || 3);
    
    // Thresholds
    this.depthThreshold = config.depthThreshold || 0.15;
    this.velocityThreshold = config.velocityThreshold || 0.3;
    
    // History for depth calculation
    this.depthHistory = [];
    this.maxHistorySize = 10;
  }

  /**
   * Detect push forward gesture
   * @param {Array} landmarks - Current frame landmarks
   * @param {Array} previousLandmarks - Previous frame landmarks
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {string} handedness - 'Left' or 'Right'
   * @returns {Object|null} Detection result
   */
  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    if (!this.isEnabled() || !landmarks || !previousLandmarks || deltaTime === 0) {
      return null;
    }

    // Calculate bounding box area to estimate depth
    const currentBox = this.landmarkProcessor.getBoundingBox(landmarks);
    const previousBox = this.landmarkProcessor.getBoundingBox(previousLandmarks);

    // Estimate depth from bounding box area (larger area = closer to camera)
    const currentDepth = currentBox.area;
    const previousDepth = previousBox.area;

    // Add to smoothing filter
    this.depthFilter.addSample(currentDepth);
    const smoothedDepth = this.depthFilter.getSmoothed();

    // Add to history
    this.depthHistory.push({
      depth: smoothedDepth,
      timestamp: performance.now()
    });

    // Keep history size limited
    if (this.depthHistory.length > this.maxHistorySize) {
      this.depthHistory.shift();
    }

    // Need at least 2 samples to calculate velocity
    if (this.depthHistory.length < 2) {
      return null;
    }

    // Calculate depth change and velocity
    const oldestSample = this.depthHistory[0];
    const newestSample = this.depthHistory[this.depthHistory.length - 1];
    
    const depthChange = newestSample.depth - oldestSample.depth;
    const timeSpan = (newestSample.timestamp - oldestSample.timestamp) / 1000; // Convert to seconds

    if (timeSpan === 0) {
      return null;
    }

    const depthVelocity = depthChange / timeSpan;

    // Normalize depth change relative to current depth
    const normalizedDepthChange = currentDepth > 0 ? depthChange / currentDepth : 0;

    // Check if push forward detected (depth increasing = hand moving toward camera)
    if (normalizedDepthChange > this.depthThreshold && depthVelocity > this.velocityThreshold) {
      // Check debouncing
      if (!this.canDetect()) {
        return null;
      }

      // Mark detection
      this.markDetection();

      // Clear history after detection
      this.depthHistory = [];

      return {
        detected: true,
        type: 'push',
        direction: 'forward',
        depth: normalizedDepthChange,
        velocity: depthVelocity,
        handedness,
        timestamp: performance.now()
      };
    }

    return null;
  }

  /**
   * Reset detector
   */
  reset() {
    super.reset();
    this.depthFilter.reset();
    this.depthHistory = [];
  }
}
