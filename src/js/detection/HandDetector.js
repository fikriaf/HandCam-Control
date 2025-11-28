// Hand detector wrapper for MediaPipe
export class HandDetector {
  constructor(mediaPipeManager, eventBus, config) {
    this.mediaPipeManager = mediaPipeManager;
    this.eventBus = eventBus;
    this.config = config;
    
    this.isRunning = false;
    this.animationFrameId = null;
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / config.targetFPS;
    
    this.handsDetected = false;
    this.noHandTimer = null;
    this.noHandTimeout = config.fallback?.noHandTimeout || 2000;
  }

  /**
   * Start detection loop
   * @param {HTMLVideoElement} videoElement - Video element to process
   */
  start(videoElement) {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.videoElement = videoElement;
    this.lastFrameTime = performance.now();
    
    this.detectLoop();
  }

  /**
   * Stop detection loop
   */
  stop() {
    this.isRunning = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.noHandTimer) {
      clearTimeout(this.noHandTimer);
      this.noHandTimer = null;
    }
  }

  /**
   * Main detection loop
   */
  detectLoop() {
    if (!this.isRunning) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    // Frame skipping logic with performance check
    if (deltaTime >= this.frameInterval) {
      const processingStart = performance.now();
      this.processFrame(currentTime);
      const processingTime = performance.now() - processingStart;
      
      // Adaptive frame skipping if processing is slow
      if (processingTime > this.frameInterval * 1.5) {
        // Skip next frame if processing took too long
        this.lastFrameTime = currentTime + this.frameInterval;
      } else {
        this.lastFrameTime = currentTime;
      }
    }

    // Continue loop
    this.animationFrameId = requestAnimationFrame(() => this.detectLoop());
  }

  /**
   * Process single frame
   * @param {number} timestamp - Current timestamp
   */
  processFrame(timestamp) {
    try {
      // Detect hands
      const results = this.mediaPipeManager.detectHands(this.videoElement, timestamp);

      if (results && results.landmarks && results.landmarks.length > 0) {
        // Hands detected
        this.handleHandsDetected(results);
      } else {
        // No hands detected
        this.handleNoHands();
      }

    } catch (error) {
      console.error('Error processing frame:', error);
      this.eventBus.emit('system:error', {
        type: 'detection',
        message: error.message
      });
    }
  }

  /**
   * Handle hands detected
   * @param {Object} results - Detection results
   */
  handleHandsDetected(results) {
    // Clear no-hand timer
    if (this.noHandTimer) {
      clearTimeout(this.noHandTimer);
      this.noHandTimer = null;
    }

    // Emit hand detected event if first detection
    if (!this.handsDetected) {
      this.handsDetected = true;
      this.eventBus.emit('hand:detected', {
        count: results.landmarks.length,
        timestamp: performance.now()
      });
    }

    // Emit hand data for each detected hand
    results.landmarks.forEach((landmarks, index) => {
      const handedness = results.handednesses[index]?.[0];
      const worldLandmarks = results.worldLandmarks?.[index];

      this.eventBus.emit('hand:data', {
        index,
        landmarks,
        worldLandmarks,
        handedness: handedness?.categoryName || 'Unknown',
        confidence: handedness?.score || 0,
        timestamp: performance.now()
      });
    });
  }

  /**
   * Handle no hands detected
   */
  handleNoHands() {
    // Start timer if not already started
    if (!this.noHandTimer && this.handsDetected) {
      this.noHandTimer = setTimeout(() => {
        this.handsDetected = false;
        this.eventBus.emit('hand:lost', {
          timestamp: performance.now()
        });
      }, this.noHandTimeout);
    }
  }

  /**
   * Check if hands are currently detected
   * @returns {boolean}
   */
  areHandsDetected() {
    return this.handsDetected;
  }

  /**
   * Set target FPS
   * @param {number} fps - Target frames per second
   */
  setTargetFPS(fps) {
    this.config.targetFPS = fps;
    this.frameInterval = 1000 / fps;
  }

  /**
   * Get current FPS
   * @returns {number}
   */
  getCurrentFPS() {
    if (this.lastFrameTime === 0) {
      return 0;
    }
    const deltaTime = performance.now() - this.lastFrameTime;
    return deltaTime > 0 ? 1000 / deltaTime : 0;
  }
}
