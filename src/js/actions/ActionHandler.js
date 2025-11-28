// Action handler for mapping gestures to actions
export class ActionHandler {
  constructor(eventBus, actionRegistry = {}) {
    this.eventBus = eventBus;
    this.actions = new Map();
    
    // Register actions from registry
    Object.entries(actionRegistry).forEach(([gestureName, actionFn]) => {
      this.registerAction(gestureName, actionFn);
    });
    
    // Subscribe to all gesture events
    this.subscribeToGestureEvents();
  }

  /**
   * Register an action for a gesture
   * @param {string} gestureName - Gesture name (e.g., 'swipe:left', 'pinch:start')
   * @param {Function} actionFunction - Function to execute
   */
  registerAction(gestureName, actionFunction) {
    if (typeof actionFunction !== 'function') {
      throw new Error('Action must be a function');
    }

    this.actions.set(gestureName, actionFunction);
  }

  /**
   * Unregister an action
   * @param {string} gestureName - Gesture name
   */
  unregisterAction(gestureName) {
    this.actions.delete(gestureName);
  }

  /**
   * Execute action for a gesture
   * @param {string} gestureName - Gesture name
   * @param {Object} data - Gesture data
   */
  executeAction(gestureName, data) {
    const action = this.actions.get(gestureName);

    if (!action) {
      // No action registered for this gesture
      return;
    }

    try {
      action(data);
    } catch (error) {
      console.error(`Error executing action for "${gestureName}":`, error);
      this.eventBus.emit('system:error', {
        type: 'action',
        gesture: gestureName,
        message: error.message
      });
    }
  }

  /**
   * Subscribe to gesture events from EventBus
   */
  subscribeToGestureEvents() {
    // Subscribe to swipe events
    this.eventBus.on('gesture:swipe:left', (data) => this.executeAction('swipe:left', data));
    this.eventBus.on('gesture:swipe:right', (data) => this.executeAction('swipe:right', data));
    this.eventBus.on('gesture:swipe:up', (data) => this.executeAction('swipe:up', data));
    this.eventBus.on('gesture:swipe:down', (data) => this.executeAction('swipe:down', data));

    // Subscribe to push events
    this.eventBus.on('gesture:push:forward', (data) => this.executeAction('push:forward', data));

    // Subscribe to pinch events
    this.eventBus.on('gesture:pinch:start', (data) => this.executeAction('pinch:start', data));
    this.eventBus.on('gesture:pinch:move', (data) => this.executeAction('pinch:move', data));
    this.eventBus.on('gesture:pinch:end', (data) => this.executeAction('pinch:end', data));
    this.eventBus.on('gesture:pinch:volume', (data) => this.executeAction('pinch:volume', data));

    // Subscribe to static gesture events
    this.eventBus.on('gesture:static:ok', (data) => this.executeAction('static:ok', data));
    this.eventBus.on('gesture:static:peace', (data) => this.executeAction('static:peace', data));
    this.eventBus.on('gesture:static:openpalm', (data) => this.executeAction('static:openpalm', data));
  }

  /**
   * Get all registered actions
   * @returns {string[]} Array of gesture names
   */
  getRegisteredActions() {
    return Array.from(this.actions.keys());
  }

  /**
   * Check if action is registered
   * @param {string} gestureName - Gesture name
   * @returns {boolean} True if registered
   */
  hasAction(gestureName) {
    return this.actions.has(gestureName);
  }

  /**
   * Clear all actions
   */
  clearAll() {
    this.actions.clear();
  }

  /**
   * Register multiple actions at once
   * @param {Object} actionMap - Map of gesture names to action functions
   */
  registerMultiple(actionMap) {
    Object.entries(actionMap).forEach(([gestureName, actionFn]) => {
      this.registerAction(gestureName, actionFn);
    });
  }
}
