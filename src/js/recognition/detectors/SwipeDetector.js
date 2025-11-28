// Swipe gesture detector
import { BaseGestureDetector } from './BaseGestureDetector.js';
import { MovingAverageFilter } from '../filters/SmoothingFilter.js';

export class SwipeDetector extends BaseGestureDetector {
  constructor(config, landmarkProcessor) {
    super(config);
    this.landmarkProcessor = landmarkProcessor;
    
    // Smoothing filters for velocity
    this.velocityFilter = new MovingAverageFilter(config.smoothingWindow || 5);
    
    // Thresholds
    this.velocityThreshold = config.velocityThreshold || 0.5;
    this.minDistance = config.minDistance || 0.1;
  }

  /**
   * Detect swipe gesture
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

    // Calculate velocity using wrist (landmark 0)
    const velocity = this.landmarkProcessor.calculateVelocity(
      landmarks,
      previousLandmarks,
      deltaTime
    );

    // Add to smoothing filter
    this.velocityFilter.addSample(velocity);
    const smoothedVelocity = this.velocityFilter.getSmoothed();

    // Check if velocity exceeds threshold
    if (smoothedVelocity.magnitude < this.velocityThreshold) {
      return null;
    }

    // Check debouncing
    if (!this.canDetect()) {
      return null;
    }

    // Determine direction based on dominant axis
    const direction = this.determineDirection(smoothedVelocity);
    
    if (!direction) {
      return null;
    }

    // Mark detection
    this.markDetection();

    return {
      detected: true,
      type: 'swipe',
      direction,
      velocity: smoothedVelocity.magnitude,
      handedness,
      timestamp: performance.now()
    };
  }

  /**
   * Determine swipe direction from velocity
   * @param {Object} velocity - Velocity {x, y, magnitude}
   * @returns {string|null} Direction ('left', 'right', 'up', 'down')
   */
  determineDirection(velocity) {
    const absX = Math.abs(velocity.x);
    const absY = Math.abs(velocity.y);

    // Determine dominant axis
    if (absX > absY) {
      // Horizontal swipe
      if (absX >= this.velocityThreshold) {
        return velocity.x > 0 ? 'right' : 'left';
      }
    } else {
      // Vertical swipe
      if (absY >= this.velocityThreshold) {
        return velocity.y > 0 ? 'down' : 'up';
      }
    }

    return null;
  }

  /**
   * Reset detector
   */
  reset() {
    super.reset();
    this.velocityFilter.reset();
  }
}
