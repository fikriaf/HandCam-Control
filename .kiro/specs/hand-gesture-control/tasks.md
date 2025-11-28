# Implementation Plan

- [x] 1. Setup project structure and core infrastructure


  - Create directory structure (src/, js/, config/, core/, detection/, recognition/, actions/, ui/, styles/, models/, electron/)
  - Create package.json with dependencies (@mediapipe/tasks-vision, webpack, electron, jest)
  - Create webpack.config.js untuk bundling
  - Create index.html dengan canvas dan video elements
  - Create main.css dengan minimal styling untuk UI controls
  - _Requirements: 1.1, 6.1, 6.2, 8.3_

- [x] 2. Implement core infrastructure modules

  - _Requirements: 1.1, 1.2, 6.2, 9.1, 9.2, 9.3, 9.4_

- [x] 2.1 Create configuration system


  - Write gestureConfig.js dengan default values untuk semua gesture thresholds
  - Write systemConfig.js dengan camera, mediapipe, dan performance settings
  - Implement config validation dan merging logic
  - _Requirements: 6.1, 9.1, 9.2, 9.3, 9.4_

- [x] 2.2 Create EventBus for custom events


  - Write EventBus.js dengan methods: on(), off(), emit(), once()
  - Implement event listener management dengan Map data structure
  - Add error handling untuk invalid event names
  - _Requirements: 6.2, 6.3_

- [x] 2.3 Create CameraManager for webcam access


  - Write CameraManager.js dengan WebRTC getUserMedia integration
  - Implement camera permission request dengan error handling
  - Implement startStream() dengan configurable resolution dan FPS
  - Implement stopStream() dengan proper resource cleanup
  - Add getVideoElement() dan getStreamDimensions() helper methods
  - _Requirements: 1.1, 1.2_

- [x] 2.4 Create MediaPipeManager for hand detection


  - Write MediaPipeManager.js dengan MediaPipe Hands initialization
  - Implement loadModel() dengan support untuk online CDN dan offline bundle
  - Implement detectHands() untuk process video frames
  - Add getHandLandmarks() dan getHandedness() methods
  - Implement proper disposal untuk cleanup resources
  - _Requirements: 1.3, 1.4, 8.1, 8.2_

- [x] 3. Implement detection layer

  - _Requirements: 1.3, 1.4, 1.5_

- [x] 3.1 Create LandmarkProcessor utility


  - Write LandmarkProcessor.js dengan landmark processing functions
  - Implement normalizeLandmarks() untuk normalize coordinates ke 0-1 range
  - Implement calculateDistance() untuk Euclidean distance antara 2 points
  - Implement calculateVelocity() untuk velocity calculation dari frame deltas
  - Implement getBoundingBox() untuk calculate hand bounding box
  - Implement getFingerStates() untuk detect open/closed fingers
  - _Requirements: 1.4_

- [x] 3.2 Create HandDetector wrapper


  - Write HandDetector.js sebagai wrapper untuk MediaPipeManager
  - Implement frame-by-frame detection loop dengan requestAnimationFrame
  - Add frame skipping logic untuk maintain target FPS
  - Implement hand tracking state management (detected/lost)
  - Emit hand:detected dan hand:lost events via EventBus
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 4. Implement smoothing and filtering system

  - _Requirements: 2.5, 4.5, 9.1, 9.5_

- [x] 4.1 Create SmoothingFilter implementations


  - Write SmoothingFilter.js dengan base class
  - Implement MovingAverageFilter dengan configurable window size
  - Implement ExponentialMovingAverageFilter dengan configurable alpha
  - Add addSample(), getSmoothed(), dan reset() methods
  - _Requirements: 2.5, 4.5, 9.1_

- [x] 4.2 Create ThresholdFilter utility


  - Write ThresholdFilter.js untuk threshold checking
  - Implement checkVelocity() untuk velocity threshold validation
  - Implement checkDistance() untuk distance threshold validation
  - Implement checkDuration() untuk duration threshold validation
  - _Requirements: 9.2, 9.3, 9.4_

- [x] 5. Implement gesture detection system

  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.3, 6.4_

- [x] 5.1 Create BaseGestureDetector abstract class


  - Write BaseGestureDetector.js dengan base interface
  - Define detect() method signature
  - Implement reset() dan getState() base methods
  - Add debouncing logic dalam base class
  - _Requirements: 6.3, 6.4_

- [x] 5.2 Implement SwipeDetector


  - Write SwipeDetector.js extending BaseGestureDetector
  - Implement wrist tracking (landmark 0) untuk swipe detection
  - Calculate velocity vector dari previous frames
  - Apply MovingAverageFilter dengan window size dari config
  - Implement direction detection (left/right/up/down) berdasarkan dominant axis
  - Add velocity threshold checking (default 0.5 unit/sec)
  - Implement debouncing 300ms untuk prevent multiple triggers
  - Emit gesture:swipe:left, gesture:swipe:right, gesture:swipe:up, gesture:swipe:down events
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5.3 Implement PinchDetector


  - Write PinchDetector.js extending BaseGestureDetector
  - Calculate distance antara thumb tip (landmark 4) dan index tip (landmark 8)
  - Apply ExponentialMovingAverageFilter dengan alpha dari config
  - Implement state machine: idle → active → released
  - Add pinch threshold checking (default 0.05 untuk active, 0.08 untuk released)
  - Track movement saat pinch active untuk drag detection
  - Detect horizontal movement untuk volume control
  - Emit gesture:pinch:start, gesture:pinch:move, gesture:pinch:end, gesture:pinch:volume events
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5.4 Implement PushDetector


  - Write PushDetector.js extending BaseGestureDetector
  - Calculate bounding box area dari hand landmarks
  - Estimate z-depth change dari box size changes (larger = closer)
  - Calculate z-velocity dari depth changes over time
  - Add depth threshold checking (default 0.15 unit)
  - Add velocity threshold checking (default 0.3 unit/sec)
  - Implement debouncing 500ms untuk prevent multiple triggers
  - Emit gesture:push:forward event
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5.5 Implement StaticGestureDetector


  - Write StaticGestureDetector.js extending BaseGestureDetector
  - Implement finger state detection (extended/bent) untuk each finger
  - Implement OK gesture detection: thumb-index circle (distance < 0.06), other fingers extended
  - Implement Peace gesture detection: index & middle extended, others bent
  - Implement Open Palm gesture detection: all fingers extended, finger spread > 0.1
  - Add gesture stability checking: same gesture for configurable duration (default 500ms)
  - Add confidence threshold checking (default 0.7)
  - Implement debouncing 1000ms after detection
  - Emit gesture:static:ok, gesture:static:peace, gesture:static:openpalm events
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5.6 Create GestureEngine coordinator


  - Write GestureEngine.js untuk coordinate all detectors
  - Implement registerDetector() untuk register detector instances
  - Implement processFrame() untuk run all active detectors
  - Add enableDetector() dan disableDetector() untuk toggle detectors
  - Integrate dengan EventBus untuk emit gesture events
  - Add performance monitoring untuk track processing time per frame
  - _Requirements: 6.3, 6.4, 7.1_

- [x] 6. Implement action handling system

  - _Requirements: 6.1, 6.2, 6.3_

- [x] 6.1 Create ActionHandler for gesture-to-action mapping


  - Write ActionHandler.js untuk map gestures ke actions
  - Implement registerAction() untuk register custom action functions
  - Implement unregisterAction() untuk remove actions
  - Implement executeAction() untuk execute registered actions
  - Subscribe ke all gesture events dari EventBus
  - Add error handling untuk action execution failures
  - _Requirements: 6.1, 6.2_

- [x] 6.2 Create actionRegistry with default implementations


  - Write actionRegistry.js dengan default action functions
  - Implement onSwipeLeft() → log "Next slide"
  - Implement onSwipeRight() → log "Previous slide"
  - Implement onSwipeUp() → log "Scroll up"
  - Implement onSwipeDown() → log "Scroll down"
  - Implement onPushForward() → log "Click"
  - Implement onPinchDrag() → log "Drag" dengan coordinates
  - Implement onPinchVolume() → log "Volume" dengan direction
  - Implement onOKGesture() → log "Open menu"
  - Implement onPeaceGesture() → log "Screenshot"
  - Implement onOpenPalmGesture() → log "Stop/Pause"
  - Add comments untuk guide user customization
  - _Requirements: 6.1, 6.5_

- [x] 7. Implement visualization and UI

  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 7.1 Create VisualizationRenderer for visual feedback


  - Write VisualizationRenderer.js untuk render pada canvas overlay
  - Implement drawLandmarks() dengan colored circles untuk each finger (thumb=red, index=blue, middle=green, ring=yellow, pinky=purple, palm=white)
  - Implement drawConnections() untuk draw skeleton lines antara landmarks
  - Implement drawGestureLabel() untuk display gesture name dan confidence
  - Implement drawBoundingBox() untuk draw hand bounding box
  - Implement drawFPS() untuk display FPS counter di top-right
  - Add clear() method untuk clear canvas
  - Add setVisible() untuk toggle visualization on/off
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 7.2 Create UIController for user controls


  - Write UIController.js untuk manage UI elements
  - Create toggle button untuk enable/disable visualization
  - Create toggle button untuk enable/disable camera
  - Create dropdown untuk select gesture presets
  - Create status indicator untuk show system state (active/idle/error)
  - Add event listeners untuk UI interactions
  - Update UI state based on system events
  - _Requirements: 10.5_

- [x] 8. Implement main application orchestration

  - _Requirements: 1.1, 1.2, 7.1, 7.2, 7.3, 9.5_

- [x] 8.1 Create main.js application entry point


  - Write main.js untuk initialize dan coordinate all modules
  - Initialize configuration dari gestureConfig dan systemConfig
  - Initialize EventBus instance
  - Initialize CameraManager dan request camera access
  - Initialize MediaPipeManager dan load model
  - Initialize HandDetector dengan camera dan mediapipe managers
  - Initialize LandmarkProcessor
  - Initialize all gesture detectors (Swipe, Pinch, Push, Static)
  - Initialize GestureEngine dan register all detectors
  - Initialize ActionHandler dan register default actions
  - Initialize VisualizationRenderer dan UIController
  - Start main processing loop dengan requestAnimationFrame
  - Add error handling untuk initialization failures
  - _Requirements: 1.1, 1.2, 7.1_

- [x] 8.2 Implement performance monitoring and optimization

  - Add FPS counter dalam main loop
  - Implement frame skipping logic ketika processing time > frame budget
  - Add CPU usage estimation based on frame processing time
  - Implement auto-throttling: reduce FPS ketika CPU usage > 80%
  - Add performance metrics logging untuk debugging
  - Emit system:fps events untuk UI updates
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 8.3 Implement error handling and recovery

  - Add try-catch blocks untuk all async operations
  - Implement camera error handling (permission denied, not found, in use)
  - Implement MediaPipe error handling (model load failure, detection errors)
  - Implement fallback mode ketika no hands detected for 2 seconds
  - Add error recovery strategies (retry, fallback to offline model)
  - Emit system:error events untuk UI notifications
  - _Requirements: 1.5, 9.5_

- [x] 9. Implement offline mode support

  - _Requirements: 8.1, 8.2_

- [x] 9.1 Setup offline model bundling

  - Download MediaPipe hand_landmarker.task model (9MB)
  - Place model file dalam src/models/ directory
  - Configure webpack untuk bundle model sebagai asset
  - Update MediaPipeManager untuk support offline model path
  - Add useOffline flag dalam systemConfig
  - _Requirements: 8.1, 8.2_

- [x] 9.2 Implement Service Worker for caching


  - Write sw.js untuk cache static assets
  - Implement install event untuk cache index.html, JS bundles, CSS, dan model
  - Implement fetch event untuk serve dari cache ketika offline
  - Register service worker dalam main.js
  - _Requirements: 8.1, 8.2_

- [x] 10. Implement Electron desktop app wrapper

  - _Requirements: 8.3, 8.4, 8.5_

- [x] 10.1 Create Electron main process


  - Create electron/main.js untuk Electron main process
  - Implement createWindow() untuk create BrowserWindow dengan proper dimensions (1280x720)
  - Configure webPreferences dengan preload script, nodeIntegration: false, contextIsolation: true
  - Load index.html dari src directory
  - Add app lifecycle handlers (ready, window-all-closed, activate)
  - _Requirements: 8.3, 8.4_

- [x] 10.2 Create Electron preload script


  - Create electron/preload.js untuk IPC communication
  - Expose safe APIs ke renderer process via contextBridge
  - Add IPC handlers untuk camera access, file system operations
  - _Requirements: 8.3, 8.4_

- [x] 10.3 Configure Electron build system


  - Create electron/package.json dengan electron-builder configuration
  - Configure build targets untuk Windows (NSIS), macOS (DMG), Linux (AppImage)
  - Add build scripts dalam root package.json (build:win, build:mac, build:linux, build:all)
  - Configure files to include (src, electron, models)
  - Add app icons untuk each platform
  - Configure asar compression untuk reduce package size
  - _Requirements: 8.3, 8.5_

- [x] 10.4 Implement auto-update functionality

  - Integrate electron-updater dalam main.js
  - Configure update server URL
  - Implement update check on app startup
  - Add UI notification untuk available updates
  - Implement download dan install update flow
  - _Requirements: 8.3_

- [x] 11. Create documentation

  - _Requirements: 6.5_

- [x] 11.1 Write README.md


  - Add project overview dan features list
  - Add installation instructions (npm install)
  - Add usage instructions (npm start untuk web, npm run electron untuk desktop)
  - Add build instructions (npm run build untuk production)
  - Add browser compatibility information
  - Add troubleshooting section
  - _Requirements: 6.5_

- [x] 11.2 Write GESTURE_GUIDE.md


  - Document all 10 supported gestures dengan descriptions
  - Add visual diagrams atau images untuk each gesture
  - Add tips untuk optimal gesture recognition
  - Add common issues dan solutions
  - _Requirements: 6.5_

- [x] 11.3 Write DEVELOPER_GUIDE.md


  - Add architecture overview dengan component diagram
  - Add step-by-step guide untuk adding new gestures
  - Add 3 example implementations (ThumbsUp, Fist, PointingFinger)
  - Add configuration reference untuk all settings
  - Add API reference untuk key classes dan methods
  - Add performance optimization tips
  - _Requirements: 6.5_

- [x] 12. Write tests

  - _Requirements: 1.4, 2.5, 4.5, 6.3_

- [x] 12.1 Write unit tests for core utilities

  - Write LandmarkProcessor.test.js untuk test distance, velocity, bounding box calculations
  - Write SmoothingFilter.test.js untuk test MovingAverage dan EMA implementations
  - Write ThresholdFilter.test.js untuk test threshold validations
  - Write EventBus.test.js untuk test event emission dan subscription
  - Configure Jest test runner
  - _Requirements: 1.4_

- [x] 12.2 Write unit tests for gesture detectors

  - Write SwipeDetector.test.js dengan mock landmark data untuk test swipe detection
  - Write PinchDetector.test.js untuk test pinch state machine
  - Write PushDetector.test.js untuk test depth estimation
  - Write StaticGestureDetector.test.js untuk test OK, Peace, OpenPalm detection
  - _Requirements: 2.5, 4.5_

- [x] 12.3 Write integration tests

  - Write integration test untuk camera → mediapipe → detection flow
  - Write integration test untuk gesture detection → event emission → action execution
  - Write integration test untuk configuration changes → system reconfiguration
  - Write integration test untuk error scenarios → error handling → recovery
  - _Requirements: 6.3_

- [x] 13. Final integration and testing


  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 4.1, 5.1, 5.2, 5.3, 7.1, 8.1, 8.2, 8.3, 8.4_

- [x] 13.1 Integrate all modules and test end-to-end

  - Test camera initialization dan permission flow
  - Test MediaPipe model loading (online dan offline)
  - Test hand detection untuk left dan right hands
  - Test all 10 gestures dengan real webcam input
  - Test smoothing dan threshold configurations
  - Test visual feedback dan UI controls
  - Test performance (FPS, CPU usage, memory)
  - Test error scenarios (no camera, model load failure, no hands detected)
  - Test offline mode functionality
  - Test Electron app build dan execution
  - Fix any bugs atau issues discovered during testing
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 4.1, 5.1, 5.2, 5.3, 7.1, 8.1, 8.2, 8.3, 8.4_
