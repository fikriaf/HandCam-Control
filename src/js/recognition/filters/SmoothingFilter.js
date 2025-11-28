// Smoothing filters for gesture detection

/**
 * Base smoothing filter class
 */
export class SmoothingFilter {
  constructor() {
    if (this.constructor === SmoothingFilter) {
      throw new Error('SmoothingFilter is abstract and cannot be instantiated');
    }
  }

  addSample(value) {
    throw new Error('addSample() must be implemented');
  }

  getSmoothed() {
    throw new Error('getSmoothed() must be implemented');
  }

  reset() {
    throw new Error('reset() must be implemented');
  }
}

/**
 * Moving Average Filter
 * Simple average of last N samples
 */
export class MovingAverageFilter extends SmoothingFilter {
  constructor(windowSize = 5) {
    super();
    this.windowSize = windowSize;
    this.samples = [];
  }

  /**
   * Add new sample to the filter
   * @param {number|Object} value - Value to add (number or object with x,y properties)
   */
  addSample(value) {
    this.samples.push(value);
    
    // Keep only last N samples
    if (this.samples.length > this.windowSize) {
      this.samples.shift();
    }
  }

  /**
   * Get smoothed value
   * @returns {number|Object} Smoothed value
   */
  getSmoothed() {
    if (this.samples.length === 0) {
      return 0;
    }

    // Check if samples are objects (e.g., {x, y})
    if (typeof this.samples[0] === 'object' && this.samples[0] !== null) {
      const sum = this.samples.reduce((acc, sample) => ({
        x: acc.x + sample.x,
        y: acc.y + sample.y
      }), { x: 0, y: 0 });

      return {
        x: sum.x / this.samples.length,
        y: sum.y / this.samples.length
      };
    }

    // Simple number average
    const sum = this.samples.reduce((acc, val) => acc + val, 0);
    return sum / this.samples.length;
  }

  /**
   * Reset filter
   */
  reset() {
    this.samples = [];
  }

  /**
   * Get current sample count
   * @returns {number}
   */
  getSampleCount() {
    return this.samples.length;
  }
}

/**
 * Exponential Moving Average Filter
 * Weighted average with more weight on recent samples
 */
export class ExponentialMovingAverageFilter extends SmoothingFilter {
  constructor(alpha = 0.3) {
    super();
    this.alpha = Math.max(0, Math.min(1, alpha)); // Clamp to [0, 1]
    this.smoothedValue = null;
  }

  /**
   * Add new sample to the filter
   * @param {number|Object} value - Value to add
   */
  addSample(value) {
    if (this.smoothedValue === null) {
      // First sample
      this.smoothedValue = value;
      return;
    }

    // Check if value is object
    if (typeof value === 'object' && value !== null) {
      this.smoothedValue = {
        x: this.alpha * value.x + (1 - this.alpha) * this.smoothedValue.x,
        y: this.alpha * value.y + (1 - this.alpha) * this.smoothedValue.y
      };
    } else {
      // Simple number
      this.smoothedValue = this.alpha * value + (1 - this.alpha) * this.smoothedValue;
    }
  }

  /**
   * Get smoothed value
   * @returns {number|Object} Smoothed value
   */
  getSmoothed() {
    return this.smoothedValue !== null ? this.smoothedValue : 0;
  }

  /**
   * Reset filter
   */
  reset() {
    this.smoothedValue = null;
  }

  /**
   * Set alpha value
   * @param {number} alpha - Smoothing factor (0-1)
   */
  setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  /**
   * Get alpha value
   * @returns {number}
   */
  getAlpha() {
    return this.alpha;
  }
}

/**
 * One Euro Filter
 * Advanced filter that adapts to velocity
 * Good for reducing jitter while maintaining responsiveness
 */
export class OneEuroFilter extends SmoothingFilter {
  constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    super();
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    
    this.x = null;
    this.dx = 0;
    this.lastTime = null;
  }

  /**
   * Add new sample with timestamp
   * @param {number} value - Value to add
   * @param {number} timestamp - Timestamp in seconds
   */
  addSample(value, timestamp) {
    if (this.x === null) {
      this.x = value;
      this.lastTime = timestamp;
      return;
    }

    const dt = timestamp - this.lastTime;
    if (dt <= 0) return;

    // Estimate velocity
    const edx = (value - this.x) / dt;
    const cutoffDx = this.dCutoff;
    const alphaDx = this.alpha(cutoffDx, dt);
    this.dx = alphaDx * edx + (1 - alphaDx) * this.dx;

    // Filter value
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    const alphaX = this.alpha(cutoff, dt);
    this.x = alphaX * value + (1 - alphaX) * this.x;

    this.lastTime = timestamp;
  }

  /**
   * Calculate alpha for exponential smoothing
   * @param {number} cutoff - Cutoff frequency
   * @param {number} dt - Time delta
   * @returns {number} Alpha value
   */
  alpha(cutoff, dt) {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  /**
   * Get smoothed value
   * @returns {number} Smoothed value
   */
  getSmoothed() {
    return this.x !== null ? this.x : 0;
  }

  /**
   * Reset filter
   */
  reset() {
    this.x = null;
    this.dx = 0;
    this.lastTime = null;
  }
}
