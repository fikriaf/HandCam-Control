// Default action registry
// Users can customize these functions to implement their own actions

/**
 * Helper function to log gesture to UI
 * @param {string} message - Message to log
 * @param {string} type - Log type ('gesture', 'info', 'error')
 */
function logToUI(message, type = 'gesture') {
  const logContainer = document.getElementById('log-container');
  if (!logContainer) return;

  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  
  logContainer.appendChild(entry);
  
  // Auto-scroll to bottom
  logContainer.scrollTop = logContainer.scrollHeight;
  
  // Keep only last 50 entries
  while (logContainer.children.length > 50) {
    logContainer.removeChild(logContainer.firstChild);
  }
}

// ============================================================================
// SWIPE GESTURES
// ============================================================================

/**
 * Swipe Left - Navigate to next slide
 * @param {Object} data - Gesture data
 */
export function onSwipeLeft(data) {
  console.log('Swipe Left detected:', data);
  logToUI(`Swipe Left → Next slide (${data.handedness} hand)`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Navigate to next slide in presentation
  // window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
}

/**
 * Swipe Right - Navigate to previous slide
 * @param {Object} data - Gesture data
 */
export function onSwipeRight(data) {
  console.log('Swipe Right detected:', data);
  logToUI(`Swipe Right → Previous slide (${data.handedness} hand)`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Navigate to previous slide in presentation
  // window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
}

/**
 * Swipe Up - Scroll up
 * @param {Object} data - Gesture data
 */
export function onSwipeUp(data) {
  console.log('Swipe Up detected:', data);
  logToUI(`Swipe Up → Scroll up (${data.handedness} hand)`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Scroll page up
  // window.scrollBy({ top: -200, behavior: 'smooth' });
}

/**
 * Swipe Down - Scroll down
 * @param {Object} data - Gesture data
 */
export function onSwipeDown(data) {
  console.log('Swipe Down detected:', data);
  logToUI(`Swipe Down → Scroll down (${data.handedness} hand)`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Scroll page down
  // window.scrollBy({ top: 200, behavior: 'smooth' });
}

// ============================================================================
// PUSH GESTURE
// ============================================================================

/**
 * Push Forward - Simulate mouse click
 * @param {Object} data - Gesture data
 */
export function onPushForward(data) {
  console.log('Push Forward detected:', data);
  logToUI(`Push Forward → Click (${data.handedness} hand)`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Simulate click at current cursor position
  // const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  // document.elementFromPoint(x, y)?.dispatchEvent(event);
}

// ============================================================================
// PINCH GESTURES
// ============================================================================

/**
 * Pinch Start - Begin drag operation
 * @param {Object} data - Gesture data
 */
export function onPinchStart(data) {
  console.log('Pinch Start detected:', data);
  logToUI(`Pinch Start → Ready to drag (${data.handedness} hand)`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Start drag operation
}

/**
 * Pinch Move - Drag operation
 * @param {Object} data - Gesture data with movement info
 */
export function onPinchMove(data) {
  console.log('Pinch Move detected:', data);
  logToUI(`Pinch Move → Dragging (dx: ${data.movement.x.toFixed(3)}, dy: ${data.movement.y.toFixed(3)})`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Move element or cursor
}

/**
 * Pinch End - End drag operation
 * @param {Object} data - Gesture data
 */
export function onPinchEnd(data) {
  console.log('Pinch End detected:', data);
  logToUI(`Pinch End → Drop (${data.handedness} hand)`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Complete drag operation
}

/**
 * Pinch Volume Control - Adjust volume
 * @param {Object} data - Gesture data with direction
 */
export function onPinchVolume(data) {
  console.log('Pinch Volume detected:', data);
  const direction = data.direction === 'right' ? 'Up' : 'Down';
  logToUI(`Pinch Volume → Volume ${direction} (${data.handedness} hand)`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Adjust system volume or media volume
  // if (data.direction === 'right') {
  //   // Increase volume
  // } else {
  //   // Decrease volume
  // }
}

// ============================================================================
// STATIC GESTURES
// ============================================================================

/**
 * OK Gesture - Open menu
 * @param {Object} data - Gesture data
 */
export function onOKGesture(data) {
  console.log('OK Gesture detected:', data);
  logToUI(`OK Gesture → Open menu (${data.handedness} hand)`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Open context menu or settings
}

/**
 * Peace Gesture - Take screenshot
 * @param {Object} data - Gesture data
 */
export function onPeaceGesture(data) {
  console.log('Peace Gesture detected:', data);
  logToUI(`Peace Gesture → Screenshot (${data.handedness} hand)`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Trigger screenshot functionality
  // Note: Browser security restrictions may limit this
}

/**
 * Open Palm Gesture - Stop/Pause
 * @param {Object} data - Gesture data
 */
export function onOpenPalmGesture(data) {
  console.log('Open Palm Gesture detected:', data);
  logToUI(`Open Palm → Stop/Pause (${data.handedness} hand)`, 'gesture');
  
  // TODO: Implement your custom action here
  // Example: Pause media playback or freeze input
}

// ============================================================================
// ACTION REGISTRY EXPORT
// ============================================================================

/**
 * Default action registry
 * Maps gesture names to action functions
 */
export const actionRegistry = {
  'swipe:left': onSwipeLeft,
  'swipe:right': onSwipeRight,
  'swipe:up': onSwipeUp,
  'swipe:down': onSwipeDown,
  'push:forward': onPushForward,
  'pinch:start': onPinchStart,
  'pinch:move': onPinchMove,
  'pinch:end': onPinchEnd,
  'pinch:volume': onPinchVolume,
  'static:ok': onOKGesture,
  'static:peace': onPeaceGesture,
  'static:openpalm': onOpenPalmGesture
};
