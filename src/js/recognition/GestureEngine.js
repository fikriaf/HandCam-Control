// Gesture engine coordinator
export class GestureEngine {
  constructor(eventBus, config) {
    this.eventBus = eventBus;
    this.config = config;
    
    // Registered detectors
    this.detectors = new Map();
    
    // Hand data history
    this.handHistory = new Map(); // Map of hand index to history
    this.maxHistorySize = 30;
    
    // Performance tracking
    this.processingTimes = [];
    this.maxProcessingTimes = 60;
  }

  /**
   * Register a gesture detector
   * @param {string} name - Detector name
   * @param {BaseGestureDetector} detector - Detector instance
   */
  registerDetector(name, detector) {
    this.detectors.set(name, detector);
  }

  /**
   * Unregister a detector
   * @param {string} name - Detector name
   */
  unregisterDetector(name) {
    this.detectors.delete(name);
  }

  /**
   * Process frame with all detectors
   * @param {Object} handData - Hand data from HandDetector
   */
  processFrame(handData) {
    const startTime = performance.now();

    try {
      const { index, landmarks, handedness, timestamp } = handData;

      // Get or create history for this hand
      if (!this.handHistory.has(index)) {
        this.handHistory.set(index, []);
      }

      const history = this.handHistory.get(index);
      
      // Get previous landmarks
      const previousLandmarks = history.length > 0 ? history[history.length - 1].landmarks : null;
      const previousTimestamp = history.length > 0 ? history[history.length - 1].timestamp : timestamp;

      // Calculate delta time
      const deltaTime = (timestamp - previousTimestamp) / 1000; // Convert to seconds

      // Add current landmarks to history
      history.push({ landmarks, timestamp });

      // Keep history size limited
      if (history.length > this.maxHistorySize) {
        history.shift();
      }

      // Run all enabled detectors
      this.detectors.forEach((detector, name) => {
        if (!detector.isEnabled()) {
          return;
        }

        try {
          const result = detector.detect(landmarks, previousLandmarks, deltaTime, handedness);

          if (result && result.detected) {
            this.emitGestureEvent(name, result);
          }
        } catch (error) {
          console.error(`Error in detector "${name}":`, error);
        }
      });

    } catch (error) {
      console.error('Error processing frame in GestureEngine:', error);
    }

    // Track processing time
    const processingTime = performance.now() - startTime;
    this.processingTimes.push(processingTime);
    
    if (this.processingTimes.length > this.maxProcessingTimes) {
      this.processingTimes.shift();
    }
  }

  /**
   * Emit gesture event
   * @param {string} detectorName - Name of detector
   * @param {Object} result - Detection result
   */
  emitGestureEvent(detectorName, result) {
    // Emit specific gesture event
    let eventName = '';

    switch (result.type) {
      case 'swipe':
        eventName = `gesture:swipe:${result.direction}`;
        break;
      case 'push':
        eventName = `gesture:push:${result.direction}`;
        break;
      case 'pinch':
        eventName = `gesture:pinch:${result.event}`;
        break;
      case 'static':
        eventName = `gesture:static:${result.gesture}`;
        break;
      default:
        eventName = `gesture:${result.type}`;
    }

    this.eventBus.emit(eventName, result);

    // Also emit generic gesture event
    this.eventBus.emit('gesture:detected', {
      detector: detectorName,
      ...result
    });
  }

  /**
   * Enable a detector
   * @param {string} name - Detector name
   */
  enableDetector(name) {
    const detector = this.detectors.get(name);
    if (detector) {
      detector.enable();
    }
  }

  /**
   * Disable a detector
   * @param {string} name - Detector name
   */
  disableDetector(name) {
    const detector = this.detectors.get(name);
    if (detector) {
      detector.disable();
    }
  }

  /**
   * Enable all detectors
   */
  enableAll() {
    this.detectors.forEach(detector => detector.enable());
  }

  /**
   * Disable all detectors
   */
  disableAll() {
    this.detectors.forEach(detector => detector.disable());
  }

  /**
   * Reset all detectors
   */
  resetAll() {
    this.detectors.forEach(detector => detector.reset());
    this.handHistory.clear();
  }

  /**
   * Get average processing time
   * @returns {number} Average processing time in milliseconds
   */
  getAverageProcessingTime() {
    if (this.processingTimes.length === 0) {
      return 0;
    }

    const sum = this.processingTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.processingTimes.length;
  }

  /**
   * Get max processing time
   * @returns {number} Max processing time in milliseconds
   */
  getMaxProcessingTime() {
    if (this.processingTimes.length === 0) {
      return 0;
    }

    return Math.max(...this.processingTimes);
  }

  /**
   * Get list of registered detectors
   * @returns {string[]} Array of detector names
   */
  getDetectorNames() {
    return Array.from(this.detectors.keys());
  }

  /**
   * Check if detector is registered
   * @param {string} name - Detector name
   * @returns {boolean} True if registered
   */
  hasDetector(name) {
    return this.detectors.has(name);
  }

  /**
   * Get detector by name
   * @param {string} name - Detector name
   * @returns {BaseGestureDetector|undefined} Detector instance
   */
  getDetector(name) {
    return this.detectors.get(name);
  }
}
