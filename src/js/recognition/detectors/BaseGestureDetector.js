// Base class for gesture detectors
export class BaseGestureDetector {
  constructor(config) {
    if (this.constructor === BaseGestureDetector) {
      throw new Error('BaseGestureDetector is abstract and cannot be instantiated');
    }

    this.config = config;
    this.state = 'idle';
    this.lastDetectionTime = 0;
    this.debounceMs = config.debounceMs || 300;
  }

  /**
   * Detect gesture from landmarks
   * Must be implemented by subclasses
   * @param {Array} landmarks - Current frame landmarks
   * @param {Array} previousLandmarks - Previous frame landmarks
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {string} handedness - 'Left' or 'Right'
   * @returns {Object|null} Detection result or null
   */
  detect(landmarks, previousLandmarks, deltaTime, handedness) {
    throw new Error('detect() must be implemented by subclass');
  }

  /**
   * Reset detector state
   */
  reset() {
    this.state = 'idle';
    this.lastDetectionTime = 0;
  }

  /**
   * Get current state
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Set state
   * @param {string} newState - New state
   */
  setState(newState) {
    this.state = newState;
  }

  /**
   * Check if enough time has passed since last detection (debouncing)
   * @returns {boolean} True if debounce period has passed
   */
  canDetect() {
    const now = performance.now();
    return (now - this.lastDetectionTime) >= this.debounceMs;
  }

  /**
   * Mark detection time
   */
  markDetection() {
    this.lastDetectionTime = performance.now();
  }

  /**
   * Check if detector is enabled
   * @returns {boolean} True if enabled
   */
  isEnabled() {
    return this.config.enabled !== false;
  }

  /**
   * Enable detector
   */
  enable() {
    this.config.enabled = true;
  }

  /**
   * Disable detector
   */
  disable() {
    this.config.enabled = false;
    this.reset();
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration values
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.debounceMs !== undefined) {
      this.debounceMs = newConfig.debounceMs;
    }
  }

  /**
   * Get configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return { ...this.config };
  }
}
