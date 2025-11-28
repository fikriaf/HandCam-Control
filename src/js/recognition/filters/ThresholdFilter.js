// Threshold filter for gesture validation
export class ThresholdFilter {
  constructor(thresholds = {}) {
    this.thresholds = {
      velocity: thresholds.velocity || 0.5,
      distance: thresholds.distance || 0.05,
      duration: thresholds.duration || 500,
      confidence: thresholds.confidence || 0.7,
      ...thresholds
    };
  }

  /**
   * Check if velocity exceeds threshold
   * @param {number|Object} velocity - Velocity value or {x, y, magnitude}
   * @returns {boolean} True if velocity exceeds threshold
   */
  checkVelocity(velocity) {
    if (typeof velocity === 'number') {
      return Math.abs(velocity) >= this.thresholds.velocity;
    }

    // Check magnitude for object velocity
    if (velocity && typeof velocity === 'object') {
      const magnitude = velocity.magnitude || 
                       Math.sqrt((velocity.x || 0) ** 2 + (velocity.y || 0) ** 2);
      return magnitude >= this.thresholds.velocity;
    }

    return false;
  }

  /**
   * Check if distance exceeds threshold
   * @param {number} distance - Distance value
   * @returns {boolean} True if distance exceeds threshold
   */
  checkDistance(distance) {
    return Math.abs(distance) >= this.thresholds.distance;
  }

  /**
   * Check if duration exceeds threshold
   * @param {number} duration - Duration in milliseconds
   * @returns {boolean} True if duration exceeds threshold
   */
  checkDuration(duration) {
    return duration >= this.thresholds.duration;
  }

  /**
   * Check if confidence exceeds threshold
   * @param {number} confidence - Confidence score (0-1)
   * @returns {boolean} True if confidence exceeds threshold
   */
  checkConfidence(confidence) {
    return confidence >= this.thresholds.confidence;
  }

  /**
   * Check if value is within range
   * @param {number} value - Value to check
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {boolean} True if value is within range
   */
  checkRange(value, min, max) {
    return value >= min && value <= max;
  }

  /**
   * Update threshold value
   * @param {string} key - Threshold key
   * @param {number} value - New threshold value
   */
  setThreshold(key, value) {
    this.thresholds[key] = value;
  }

  /**
   * Get threshold value
   * @param {string} key - Threshold key
   * @returns {number} Threshold value
   */
  getThreshold(key) {
    return this.thresholds[key];
  }

  /**
   * Get all thresholds
   * @returns {Object} All threshold values
   */
  getAllThresholds() {
    return { ...this.thresholds };
  }

  /**
   * Reset thresholds to defaults
   * @param {Object} defaults - Default threshold values
   */
  reset(defaults = {}) {
    this.thresholds = {
      velocity: 0.5,
      distance: 0.05,
      duration: 500,
      confidence: 0.7,
      ...defaults
    };
  }
}
