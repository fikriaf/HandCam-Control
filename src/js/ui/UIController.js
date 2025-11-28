// UI controller for user interface elements
export class UIController {
  constructor(eventBus) {
    this.eventBus = eventBus;
    
    // UI elements
    this.elements = {
      btnCamera: document.getElementById('btn-camera'),
      btnVisualization: document.getElementById('btn-visualization'),
      gesturePreset: document.getElementById('gesture-preset'),
      statusIndicator: document.getElementById('status-indicator'),
      fpsCounter: document.getElementById('fps-counter')
    };
    
    // State
    this.cameraActive = false;
    this.visualizationEnabled = true;
    
    // Initialize event listeners
    this.initializeEventListeners();
    this.subscribeToSystemEvents();
  }

  /**
   * Initialize UI event listeners
   */
  initializeEventListeners() {
    // Camera button
    if (this.elements.btnCamera) {
      this.elements.btnCamera.addEventListener('click', () => {
        this.toggleCamera();
      });
    }

    // Visualization button
    if (this.elements.btnVisualization) {
      this.elements.btnVisualization.addEventListener('click', () => {
        this.toggleVisualization();
      });
    }

    // Gesture preset selector
    if (this.elements.gesturePreset) {
      this.elements.gesturePreset.addEventListener('change', (e) => {
        this.changeGesturePreset(e.target.value);
      });
    }
  }

  /**
   * Subscribe to system events
   */
  subscribeToSystemEvents() {
    // Hand detection events
    this.eventBus.on('hand:detected', () => {
      this.updateStatus('active', 'Hands Detected');
    });

    this.eventBus.on('hand:lost', () => {
      this.updateStatus('idle', 'No Hands Detected');
    });

    // System error events
    this.eventBus.on('system:error', (error) => {
      this.updateStatus('error', `Error: ${error.message}`);
    });

    // FPS updates
    this.eventBus.on('system:fps', (fps) => {
      this.updateFPS(fps);
    });
  }

  /**
   * Toggle camera on/off
   */
  toggleCamera() {
    this.cameraActive = !this.cameraActive;
    
    if (this.cameraActive) {
      this.eventBus.emit('ui:camera:start');
      this.updateCameraButton('Stop Camera', true);
      this.updateStatus('idle', 'Camera Active');
    } else {
      this.eventBus.emit('ui:camera:stop');
      this.updateCameraButton('Start Camera', false);
      this.updateStatus('idle', 'Camera Stopped');
    }
  }

  /**
   * Toggle visualization on/off
   */
  toggleVisualization() {
    this.visualizationEnabled = !this.visualizationEnabled;
    this.eventBus.emit('ui:visualization:toggle', this.visualizationEnabled);
    
    const text = this.visualizationEnabled ? 'Hide Visualization' : 'Show Visualization';
    if (this.elements.btnVisualization) {
      this.elements.btnVisualization.textContent = text;
    }
  }

  /**
   * Change gesture preset
   * @param {string} preset - Preset name ('all', 'navigation', 'control')
   */
  changeGesturePreset(preset) {
    this.eventBus.emit('ui:preset:change', preset);
    
    // Update status
    const presetNames = {
      'all': 'All Gestures',
      'navigation': 'Navigation Only',
      'control': 'Control Only'
    };
    
    this.updateStatus('idle', `Preset: ${presetNames[preset] || preset}`);
  }

  /**
   * Update camera button
   * @param {string} text - Button text
   * @param {boolean} active - Active state
   */
  updateCameraButton(text, active) {
    if (this.elements.btnCamera) {
      this.elements.btnCamera.textContent = text;
      this.elements.btnCamera.classList.toggle('active', active);
    }
  }

  /**
   * Update status indicator
   * @param {string} state - State ('idle', 'active', 'error')
   * @param {string} message - Status message
   */
  updateStatus(state, message) {
    if (this.elements.statusIndicator) {
      this.elements.statusIndicator.textContent = message;
      this.elements.statusIndicator.className = `status ${state}`;
    }
  }

  /**
   * Update FPS counter
   * @param {number} fps - Current FPS
   */
  updateFPS(fps) {
    if (this.elements.fpsCounter) {
      this.elements.fpsCounter.textContent = `FPS: ${fps.toFixed(1)}`;
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.updateStatus('error', message);
    console.error(message);
  }

  /**
   * Show info message
   * @param {string} message - Info message
   */
  showInfo(message) {
    this.updateStatus('idle', message);
  }

  /**
   * Enable/disable controls
   * @param {boolean} enabled - Enabled state
   */
  setControlsEnabled(enabled) {
    Object.values(this.elements).forEach(element => {
      if (element && element.tagName !== 'SPAN') {
        element.disabled = !enabled;
      }
    });
  }

  /**
   * Reset UI to initial state
   */
  reset() {
    this.cameraActive = false;
    this.visualizationEnabled = true;
    
    this.updateCameraButton('Start Camera', false);
    if (this.elements.btnVisualization) {
      this.elements.btnVisualization.textContent = 'Hide Visualization';
    }
    if (this.elements.gesturePreset) {
      this.elements.gesturePreset.value = 'all';
    }
    
    this.updateStatus('idle', 'System Ready');
    this.updateFPS(0);
  }

  /**
   * Get current UI state
   * @returns {Object} UI state
   */
  getState() {
    return {
      cameraActive: this.cameraActive,
      visualizationEnabled: this.visualizationEnabled,
      gesturePreset: this.elements.gesturePreset?.value || 'all'
    };
  }
}
