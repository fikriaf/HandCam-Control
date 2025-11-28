// Main application entry point
import { EventBus } from './core/EventBus.js';
import { CameraManager } from './core/CameraManager.js';
import { MediaPipeManager } from './core/MediaPipeManager.js';
import { HandDetector } from './detection/HandDetector.js';
import { LandmarkProcessor } from './detection/LandmarkProcessor.js';
import { GestureEngine } from './recognition/GestureEngine.js';
import { SwipeDetector } from './recognition/detectors/SwipeDetector.js';
import { PinchDetector } from './recognition/detectors/PinchDetector.js';
import { PushDetector } from './recognition/detectors/PushDetector.js';
import { StaticGestureDetector } from './recognition/detectors/StaticGestureDetector.js';
import { ActionHandler } from './actions/ActionHandler.js';
import { actionRegistry } from './actions/actionRegistry.js';
import { VisualizationRenderer } from './ui/VisualizationRenderer.js';
import { UIController } from './ui/UIController.js';
import { gestureConfig, validateConfig } from './config/gestureConfig.js';
import { systemConfig, validateSystemConfig } from './config/systemConfig.js';

class HandGestureControlApp {
  constructor() {
    this.initialized = false;
    this.running = false;
    
    // Configuration
    this.gestureConfig = validateConfig();
    this.systemConfig = validateSystemConfig();
    
    // Core components
    this.eventBus = null;
    this.cameraManager = null;
    this.mediaPipeManager = null;
    this.handDetector = null;
    this.landmarkProcessor = null;
    this.gestureEngine = null;
    this.actionHandler = null;
    this.visualizationRenderer = null;
    this.uiController = null;
    
    // Performance tracking
    this.fpsHistory = [];
    this.lastFPSUpdate = 0;
    this.frameCount = 0;
    
    // Hand data for visualization
    this.currentHandsData = [];
  }

  /**
   * Initialize application
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing Hand Gesture Control System...');

      // Initialize EventBus
      this.eventBus = new EventBus();
      console.log('✓ EventBus initialized');

      // Initialize CameraManager
      this.cameraManager = new CameraManager(this.systemConfig.camera);
      await this.cameraManager.initialize();
      console.log('✓ CameraManager initialized');

      // Initialize MediaPipeManager
      this.mediaPipeManager = new MediaPipeManager(this.systemConfig.mediapipe);
      console.log('Loading MediaPipe model...');
      await this.mediaPipeManager.loadModel();
      console.log('✓ MediaPipe model loaded');

      // Initialize LandmarkProcessor
      this.landmarkProcessor = new LandmarkProcessor();
      console.log('✓ LandmarkProcessor initialized');

      // Initialize HandDetector
      this.handDetector = new HandDetector(
        this.mediaPipeManager,
        this.eventBus,
        this.systemConfig.performance
      );
      console.log('✓ HandDetector initialized');

      // Initialize GestureEngine
      this.gestureEngine = new GestureEngine(this.eventBus, this.gestureConfig);
      console.log('✓ GestureEngine initialized');

      // Initialize and register gesture detectors
      this.initializeGestureDetectors();
      console.log('✓ Gesture detectors registered');

      // Initialize ActionHandler
      this.actionHandler = new ActionHandler(this.eventBus, actionRegistry);
      console.log('✓ ActionHandler initialized');

      // Initialize VisualizationRenderer
      const canvas = document.getElementById('canvas-overlay');
      this.visualizationRenderer = new VisualizationRenderer(
        canvas,
        this.systemConfig.visualization
      );
      console.log('✓ VisualizationRenderer initialized');

      // Initialize UIController
      this.uiController = new UIController(this.eventBus);
      console.log('✓ UIController initialized');

      // Setup event listeners
      this.setupEventListeners();
      console.log('✓ Event listeners setup');

      this.initialized = true;
      console.log('✓ System initialized successfully');

      this.uiController.showInfo('System Ready - Click "Start Camera" to begin');

    } catch (error) {
      console.error('Initialization error:', error);
      if (this.uiController) {
        this.uiController.showError(`Initialization failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Initialize gesture detectors
   */
  initializeGestureDetectors() {
    // Swipe detector
    const swipeDetector = new SwipeDetector(
      this.gestureConfig.swipe,
      this.landmarkProcessor
    );
    this.gestureEngine.registerDetector('swipe', swipeDetector);

    // Pinch detector
    const pinchDetector = new PinchDetector(
      this.gestureConfig.pinch,
      this.landmarkProcessor
    );
    this.gestureEngine.registerDetector('pinch', pinchDetector);

    // Push detector
    const pushDetector = new PushDetector(
      this.gestureConfig.push,
      this.landmarkProcessor
    );
    this.gestureEngine.registerDetector('push', pushDetector);

    // Static gesture detector
    const staticDetector = new StaticGestureDetector(
      this.gestureConfig.static,
      this.landmarkProcessor
    );
    this.gestureEngine.registerDetector('static', staticDetector);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // UI events
    this.eventBus.on('ui:camera:start', () => this.startCamera());
    this.eventBus.on('ui:camera:stop', () => this.stopCamera());
    this.eventBus.on('ui:visualization:toggle', (enabled) => {
      this.visualizationRenderer.setVisible(enabled);
    });
    this.eventBus.on('ui:preset:change', (preset) => this.changePreset(preset));

    // Hand detection events
    this.eventBus.on('hand:data', (handData) => {
      // Process with gesture engine
      this.gestureEngine.processFrame(handData);
      
      // Store for visualization
      this.updateHandsData(handData);
    });

    // Gesture events for visualization
    this.eventBus.on('gesture:detected', (data) => {
      const gestureName = data.name || `${data.type}:${data.direction || data.gesture || data.event}`;
      this.visualizationRenderer.drawGestureLabel(
        gestureName,
        data.confidence || 0.9,
        data.position || { x: 0.5, y: 0.1 }
      );
    });
  }

  /**
   * Start camera and detection
   */
  async startCamera() {
    if (this.running) {
      return;
    }

    try {
      this.uiController.showInfo('Starting camera...');

      // Start camera stream
      await this.cameraManager.startStream();
      
      // Resize canvas to match video
      const dimensions = this.cameraManager.getStreamDimensions();
      this.visualizationRenderer.resize(dimensions.width, dimensions.height);

      // Start hand detection
      const videoElement = this.cameraManager.getVideoElement();
      this.handDetector.start(videoElement);

      // Start rendering loop
      this.running = true;
      this.startRenderLoop();

      this.uiController.showInfo('Camera active - Show your hands');

    } catch (error) {
      console.error('Error starting camera:', error);
      this.uiController.showError(error.message);
    }
  }

  /**
   * Stop camera and detection
   */
  stopCamera() {
    if (!this.running) {
      return;
    }

    this.running = false;
    this.handDetector.stop();
    this.cameraManager.stopStream();
    this.visualizationRenderer.clear();
    this.currentHandsData = [];

    this.uiController.showInfo('Camera stopped');
  }

  /**
   * Start rendering loop
   */
  startRenderLoop() {
    const render = () => {
      if (!this.running) {
        return;
      }

      // Calculate FPS
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFPSUpdate >= 1000) {
        const fps = this.frameCount;
        this.frameCount = 0;
        this.lastFPSUpdate = now;

        // Emit FPS event
        this.eventBus.emit('system:fps', fps);

        // Render visualization with FPS
        this.visualizationRenderer.render(this.currentHandsData, fps);
      } else {
        // Render without updating FPS
        this.visualizationRenderer.render(this.currentHandsData);
      }

      requestAnimationFrame(render);
    };

    render();
  }

  /**
   * Update hands data for visualization
   * @param {Object} handData - Hand data from detector
   */
  updateHandsData(handData) {
    // Find or add hand data
    const existingIndex = this.currentHandsData.findIndex(h => h.index === handData.index);
    
    if (existingIndex >= 0) {
      this.currentHandsData[existingIndex] = handData;
    } else {
      this.currentHandsData.push(handData);
    }

    // Remove old hands (not updated in last 500ms)
    const now = performance.now();
    this.currentHandsData = this.currentHandsData.filter(h => now - h.timestamp < 500);
  }

  /**
   * Change gesture preset
   * @param {string} preset - Preset name
   */
  changePreset(preset) {
    switch (preset) {
      case 'navigation':
        // Enable only swipe gestures
        this.gestureEngine.enableDetector('swipe');
        this.gestureEngine.disableDetector('pinch');
        this.gestureEngine.disableDetector('push');
        this.gestureEngine.disableDetector('static');
        break;

      case 'control':
        // Enable only control gestures
        this.gestureEngine.disableDetector('swipe');
        this.gestureEngine.enableDetector('pinch');
        this.gestureEngine.enableDetector('push');
        this.gestureEngine.enableDetector('static');
        break;

      case 'all':
      default:
        // Enable all gestures
        this.gestureEngine.enableAll();
        break;
    }
  }

  /**
   * Cleanup and dispose resources
   */
  dispose() {
    this.stopCamera();
    
    if (this.mediaPipeManager) {
      this.mediaPipeManager.dispose();
    }
    
    if (this.eventBus) {
      this.eventBus.clear();
    }
  }
}

// Initialize app when DOM is ready
let app = null;

window.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing application...');
  
  try {
    app = new HandGestureControlApp();
    await app.initialize();
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (app) {
    app.dispose();
  }
});

// Export for debugging
window.app = app;
