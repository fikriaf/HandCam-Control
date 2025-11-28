# Gesture Guide

Complete guide to all supported gestures in the Hand Gesture Control System.

## Overview

The system recognizes 10 different hand gestures across 4 categories:
- **Swipe Gestures**: Dynamic movements for navigation
- **Push Gesture**: Forward movement for clicking
- **Pinch Gestures**: Precision control for drag and volume
- **Static Gestures**: Held hand poses for specific actions

## Gesture Details

### 1. Swipe Left

**Action**: Navigate to next slide / Move right

**How to Perform**:
1. Extend your hand with palm facing the camera
2. Quickly move your hand to the left
3. Maintain a smooth, swift motion

**Tips**:
- Move at least 10cm horizontally
- Speed matters - move quickly for detection
- Keep hand flat and visible

**Common Issues**:
- Too slow: Increase movement speed
- Not detected: Ensure hand stays in frame
- False triggers: Adjust `velocityThreshold` in config

---

### 2. Swipe Right

**Action**: Navigate to previous slide / Move left

**How to Perform**:
1. Extend your hand with palm facing the camera
2. Quickly move your hand to the right
3. Maintain a smooth, swift motion

**Tips**:
- Same as Swipe Left but in opposite direction
- Works with either hand

---

### 3. Swipe Up

**Action**: Scroll up / Move up

**How to Perform**:
1. Extend your hand with palm facing the camera
2. Quickly move your hand upward
3. Keep motion vertical

**Tips**:
- Vertical movement should be dominant
- Avoid diagonal movements
- Works best with arm movement, not just wrist

---

### 4. Swipe Down

**Action**: Scroll down / Move down

**How to Perform**:
1. Extend your hand with palm facing the camera
2. Quickly move your hand downward
3. Keep motion vertical

**Tips**:
- Same as Swipe Up but downward
- Natural scrolling motion

---

### 5. Push Forward

**Action**: Click / Select

**How to Perform**:
1. Extend your hand toward the camera
2. Push hand forward quickly
3. Hand should appear larger in frame

**Tips**:
- Move at least 15cm toward camera
- Quick motion is key
- Works like "poking" the screen

**Common Issues**:
- Not detected: Push more aggressively
- Multiple triggers: Wait for debounce period (500ms)

---

### 6. Pinch (Start/Move/End)

**Action**: Drag and drop

**How to Perform**:
1. **Start**: Touch thumb tip to index finger tip
2. **Move**: While pinching, move your hand
3. **End**: Separate thumb and index finger

**Tips**:
- Keep pinch tight (< 5cm between fingers)
- Movement is tracked while pinching
- Release cleanly to drop

**Common Issues**:
- Pinch not detected: Bring fingers closer together
- Accidental release: Maintain firm pinch
- Jittery movement: Enable smoothing in config

---

### 7. Pinch + Horizontal Movement

**Action**: Volume control

**How to Perform**:
1. Pinch thumb and index finger together
2. Move hand left (decrease) or right (increase)
3. Maintain pinch throughout movement

**Tips**:
- Horizontal movement must be dominant
- Move at least 2cm horizontally
- Works like a slider control

---

### 8. OK Gesture

**Action**: Open menu / Confirm

**How to Perform**:
1. Touch thumb tip to index finger tip (form circle)
2. Extend other three fingers (middle, ring, pinky)
3. Hold for 500ms

**Tips**:
- Circle should be clear and tight
- Other fingers must be extended
- Hold steady for detection

**Common Issues**:
- Not detected: Ensure other fingers are fully extended
- Too sensitive: Increase `holdDuration` in config

---

### 9. Peace Gesture

**Action**: Screenshot / Capture

**How to Perform**:
1. Extend index and middle fingers
2. Keep thumb, ring, and pinky fingers closed
3. Hold for 500ms

**Tips**:
- Two fingers should be clearly separated
- Keep other fingers tucked in
- Classic "peace sign" or "victory" pose

**Common Issues**:
- Confused with other gestures: Ensure only 2 fingers extended
- Not stable: Hold hand steady

---

### 10. Open Palm

**Action**: Stop / Pause / Freeze

**How to Perform**:
1. Extend all five fingers
2. Spread fingers apart
3. Hold for 800ms

**Tips**:
- All fingers must be clearly extended
- Spread fingers wide (> 10cm span)
- Like showing "stop" hand signal

**Common Issues**:
- Not detected: Spread fingers wider
- Confused with other gestures: Ensure all 5 fingers visible

---

## General Tips for Best Results

### Lighting
- Use good, even lighting
- Avoid backlighting (light behind you)
- Natural daylight works best

### Camera Position
- Position camera at eye level
- Keep 50-100cm distance from camera
- Ensure full hand is visible in frame

### Hand Visibility
- Remove gloves or hand coverings
- Avoid busy backgrounds
- Keep hand in front of body

### Performance
- Use one hand at a time for clearer detection
- Make deliberate, clear movements
- Wait for visual feedback before next gesture

### Calibration
- Test each gesture individually first
- Adjust thresholds if needed
- Practice smooth, consistent movements

## Troubleshooting

### Gesture Not Detected
1. Check hand is fully visible in frame
2. Verify good lighting conditions
3. Increase gesture hold duration
4. Lower detection thresholds

### False Positives
1. Increase velocity/distance thresholds
2. Enable longer debounce periods
3. Increase hold duration for static gestures
4. Reduce hand movement when not gesturing

### Inconsistent Detection
1. Enable smoothing filters
2. Improve lighting conditions
3. Keep hand steady during static gestures
4. Use more deliberate movements

## Configuration Reference

Adjust these parameters in `src/js/config/gestureConfig.js`:

```javascript
{
  swipe: {
    velocityThreshold: 0.5,    // Lower = more sensitive
    smoothingWindow: 5,         // Higher = smoother but slower
    debounceMs: 300            // Higher = less frequent triggers
  },
  
  pinch: {
    distanceThreshold: 0.05,   // Lower = easier to trigger
    releaseThreshold: 0.08,    // Higher = easier to release
    smoothingAlpha: 0.3        // Lower = smoother
  },
  
  push: {
    depthThreshold: 0.15,      // Lower = more sensitive
    velocityThreshold: 0.3,    // Lower = easier to trigger
    debounceMs: 500
  },
  
  static: {
    holdDuration: 500,         // Lower = faster detection
    confidenceThreshold: 0.7,  // Lower = more lenient
    debounceMs: 1000
  }
}
```

## Practice Exercises

1. **Swipe Practice**: Try swiping in all 4 directions smoothly
2. **Pinch Control**: Practice pinching and moving in straight lines
3. **Static Holds**: Hold each static gesture for 3 seconds
4. **Combination**: Swipe left, then OK gesture, then swipe right
5. **Speed Test**: Perform 10 swipes as fast as possible

## Advanced Usage

### Custom Gesture Combinations
- Combine gestures for complex actions
- Use different hands for different gesture types
- Create gesture sequences (macros)

### Accessibility
- Adjust thresholds for limited mobility
- Use single-hand mode
- Increase hold durations for stability

### Gaming Applications
- Map gestures to game controls
- Use swipes for movement
- Use pinch for aiming/shooting

## Support

For additional help or to report issues with gesture detection, please open an issue on GitHub with:
- Description of the gesture
- Your configuration settings
- Video/screenshot if possible
