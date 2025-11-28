// Custom event bus for gesture events
export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function to execute
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (typeof eventName !== 'string' || !eventName) {
      throw new Error('Event name must be a non-empty string');
    }
    
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    this.listeners.get(eventName).push(callback);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function to remove
   */
  off(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      return;
    }

    const callbacks = this.listeners.get(eventName);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }

    // Clean up empty listener arrays
    if (callbacks.length === 0) {
      this.listeners.delete(eventName);
    }
  }

  /**
   * Emit an event
   * @param {string} eventName - Name of the event
   * @param {*} data - Data to pass to callbacks
   */
  emit(eventName, data) {
    if (!this.listeners.has(eventName)) {
      return;
    }

    const callbacks = this.listeners.get(eventName);
    
    // Execute all callbacks
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${eventName}":`, error);
      }
    });
  }

  /**
   * Subscribe to an event once (auto-unsubscribe after first call)
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function to execute
   * @returns {Function} Unsubscribe function
   */
  once(eventName, callback) {
    const onceWrapper = (data) => {
      callback(data);
      this.off(eventName, onceWrapper);
    };

    return this.on(eventName, onceWrapper);
  }

  /**
   * Remove all listeners for an event or all events
   * @param {string} [eventName] - Optional event name to clear
   */
  clear(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get number of listeners for an event
   * @param {string} eventName - Name of the event
   * @returns {number} Number of listeners
   */
  listenerCount(eventName) {
    if (!this.listeners.has(eventName)) {
      return 0;
    }
    return this.listeners.get(eventName).length;
  }

  /**
   * Get all event names
   * @returns {string[]} Array of event names
   */
  eventNames() {
    return Array.from(this.listeners.keys());
  }
}
