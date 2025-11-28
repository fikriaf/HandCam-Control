// Static gesture detector (OK, Peace, Open Palm)
import { BaseGestureDetector } from './BaseGestureDetector.js';

export class StaticGestureDetector extends BaseGestureDetector {
  constructor(config, landmarkProcessor) {
    super(config);
    this.landmarkProcessor = landmarkProcessor;
    
    // Thresholds
    this.holdDuration = config.holdDuration || 500;
    this.confidenceThreshold = config.confidenceThreshold || 0.7;
    this.fingerExtensionThreshold = config.fingerExtensionThreshold || 0.6;
    
    // Gesture tracking
    this.currentGesture = null;
    this.gestureStartTime = null;
    this.gestureConfidence = 0;
  }

  /**
   * Detect static gestures
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

    // Get finger states
    const fingerStates = this.landmarkProcessor.getFingerStates(landmarks);

    // Detect specific gestures
    const okGesture = this.detectOKGesture(landmarks, fingerStates);
    const peaceGesture = this.detectPeaceGesture(landmarks, fingerStates);
    const openPalmGesture = this.detectOpenPalmGesture(landmarks, fingerStates);

    // Determine which gesture is detected
    let detectedGesture = null;
    let confidence = 0;

    if (okGesture.detected) {
      detectedGesture = 'ok';
      confidence = okGesture.confidence;
    } else if (peaceGesture.detected) {
      detectedGesture = 'peace';
      confidence = peaceGesture.confidence;
    } else if (openPalmGesture.detected) {
      detectedGesture = 'openpalm';
      confidence = openPalmGesture.confidence;
    }

    // Check if gesture is stable
    return this.checkGestureStability(detectedGesture, confidence, handedness);
  }

  /**
   * Detect OK gesture (thumb and index form circle, others extended)
   * @param {Array} landmarks - Hand landmarks
   * @param {Object} fingerStates - Finger extension states
   * @returns {Object} Detection result
   */
  detectOKGesture(landmarks, fingerStates) {
    // Check thumb-index distance (should be close)
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const distance = this.landmarkProcessor.calculateDistance(thumbTip, indexTip);

    // Thumb and index should be close (forming circle)
    const circleFormed = distance < 0.06;

    // Other fingers should be extended
    const othersExtended = fingerStates.middle && fingerStates.ring && fingerStates.pinky;

    const detected = circleFormed && othersExtended;
    const confidence = detected ? 0.9 : 0.0;

    return { detected, confidence };
  }

  /**
   * Detect Peace gesture (index and middle extended, others closed)
   * @param {Array} landmarks - Hand landmarks
   * @param {Object} fingerStates - Finger extension states
   * @returns {Object} Detection result
   */
  detectPeaceGesture(landmarks, fingerStates) {
    // Index and middle should be extended
    const twoFingersUp = fingerStates.index && fingerStates.middle;

    // Thumb, ring, and pinky should be closed
    const othersClosed = !fingerStates.thumb && !fingerStates.ring && !fingerStates.pinky;

    // Check if index and middle are separated
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const separation = this.landmarkProcessor.calculateDistance(indexTip, middleTip);
    const separated = separation > 0.05;

    const detected = twoFingersUp && othersClosed && separated;
    const confidence = detected ? 0.85 : 0.0;

    return { detected, confidence };
  }

  /**
   * Detect Open Palm gesture (all fingers extended and spread)
   * @param {Array} landmarks - Hand landmarks
   * @param {Object} fingerStates - Finger extension states
   * @returns {Object} Detection result
   */
  detectOpenPalmGesture(landmarks, fingerStates) {
    // All fingers should be extended
    const allExtended = fingerStates.thumb && 
                       fingerStates.index && 
                       fingerStates.middle && 
                       fingerStates.ring && 
                       fingerStates.pinky;

    // Fingers should be spread apart
    const fingersSpread = this.landmarkProcessor.areFingersSpread(landmarks);

    const detected = allExtended && fingersSpread;
    const confidence = detected ? 0.9 : 0.0;

    return { detected, confidence };
  }

  /**
   * Check gesture stability over time
   * @param {string|null} gesture - Detected gesture name
   * @param {number} confidence - Gesture confidence
   * @param {string} handedness - Hand side
   * @returns {Object|null} Detection result
   */
  checkGestureStability(gesture, confidence, handedness) {
    const now = performance.now();

    // No gesture detected
    if (!gesture || confidence < this.confidenceThreshold) {
      this.currentGesture = null;
      this.gestureStartTime = null;
      this.gestureConfidence = 0;
      return null;
    }

    // Same gesture as before
    if (gesture === this.currentGesture) {
      // Check if held long enough
      const holdTime = now - this.gestureStartTime;
      
      if (holdTime >= this.holdDuration) {
        // Check debouncing
        if (!this.canDetect()) {
          return null;
        }

        // Mark detection
        this.markDetection();

        // Reset tracking
        this.currentGesture = null;
        this.gestureStartTime = null;

        return {
          detected: true,
          type: 'static',
          gesture,
          confidence,
          holdTime,
          handedness,
          timestamp: now
        };
      }
    } else {
      // New gesture detected
      this.currentGesture = gesture;
      this.gestureStartTime = now;
      this.gestureConfidence = confidence;
    }

    return null;
  }

  /**
   * Reset detector
   */
  reset() {
    super.reset();
    this.currentGesture = null;
    this.gestureStartTime = null;
    this.gestureConfidence = 0;
  }
}
