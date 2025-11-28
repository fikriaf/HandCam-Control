// Pinch gesture detector
import { BaseGestureDetector } from './BaseGestureDetector.js';
import { ExponentialMovingAverageFilter } from '../filters/SmoothingFilter.js';

export class PinchDetector extends BaseGestureDetector {
  constructor(config, landmarkProcessor) {
    super(config);
    this.landmarkProcessor = landmarkProcessor;
    
    // Smoothing filter for distance
    this.distanceFilter = new ExponentialMovingAverageFilter(config.smoothingAlpha || 0.3);
    
    // Thresholds
    this.distanceThreshold = config.distanceThreshold || 0.05;
    this.releaseThreshold = config.releaseThreshold || 0.08;
    this.volumeThreshold = config.volumeThreshold || 0.02;
    
    // State tracking
    this.pinchState = 'idle'; // idle, active, released
    this.pinchStartPosition = null;
    this.lastPosition = null;
  }

  /**
   * Detect pinch gesture
   * @param {Array} landmarks - Current frame landmarks
   * @param {Array} previousLandmarks - Previous frame landmarks
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {string} handedness - 'Left' or 'Right'
   * @returns {Object|null} Detection result
   */
  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    if (!this.isEnabled() || !landmarks || landmarks.length < 21) {
      return null;
    }

    // Get thumb tip (4) and index tip (8)
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    // Calculate distance
    const distance = this.landmarkProcessor.calculateDistance(thumbTip, indexTip);
    
    // Apply smoothing
    this.distanceFilter.addSample(distance);
    const smoothedDistance = this.distanceFilter.getSmoothed();

    // State machine
    const result = this.updatePinchState(smoothedDistance, indexTip, handedness);

    return result;
  }

  /**
   * Update pinch state machine
   * @param {number} distance - Smoothed distance between thumb and index
   * @param {Object} currentPosition - Current index finger position
   * @param {string} handedness - Hand side
   * @returns {Object|null} Detection result
   */
  updatePinchState(distance, currentPosition, handedness) {
    const now = performance.now();

    switch (this.pinchState) {
      case 'idle':
        // Check if pinch activated
        if (distance < this.distanceThreshold) {
          this.pinchState = 'active';
          this.pinchStartPosition = { ...currentPosition };
          this.lastPosition = { ...currentPosition };
          
          return {
            detected: true,
            type: 'pinch',
            event: 'start',
            distance,
            position: currentPosition,
            handedness,
            timestamp: now
          };
        }
        break;

      case 'active':
        // Check if pinch released
        if (distance > this.releaseThreshold) {
          this.pinchState = 'idle';
          this.pinchStartPosition = null;
          this.lastPosition = null;
          
          return {
            detected: true,
            type: 'pinch',
            event: 'end',
            distance,
            position: currentPosition,
            handedness,
            timestamp: now
          };
        }

        // Pinch is still active - check for movement
        if (this.lastPosition) {
          const movement = {
            x: currentPosition.x - this.lastPosition.x,
            y: currentPosition.y - this.lastPosition.y
          };
          const movementMagnitude = Math.sqrt(movement.x ** 2 + movement.y ** 2);

          this.lastPosition = { ...currentPosition };

          // Check for drag movement
          if (movementMagnitude > 0.005) {
            return {
              detected: true,
              type: 'pinch',
              event: 'move',
              distance,
              position: currentPosition,
              movement,
              movementMagnitude,
              handedness,
              timestamp: now
            };
          }

          // Check for horizontal movement (volume control)
          if (Math.abs(movement.x) > this.volumeThreshold && Math.abs(movement.x) > Math.abs(movement.y)) {
            return {
              detected: true,
              type: 'pinch',
              event: 'volume',
              distance,
              position: currentPosition,
              direction: movement.x > 0 ? 'right' : 'left',
              magnitude: Math.abs(movement.x),
              handedness,
              timestamp: now
            };
          }
        }
        break;
    }

    return null;
  }

  /**
   * Reset detector
   */
  reset() {
    super.reset();
    this.distanceFilter.reset();
    this.pinchState = 'idle';
    this.pinchStartPosition = null;
    this.lastPosition = null;
  }

  /**
   * Get current pinch state
   * @returns {string} Current state
   */
  getPinchState() {
    return this.pinchState;
  }
}
