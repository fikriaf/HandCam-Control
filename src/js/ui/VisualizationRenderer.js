// Visualization renderer for hand landmarks and gestures
export class VisualizationRenderer {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.visible = config.enabled !== false;
    
    // Colors for different fingers
    this.colors = config.colors || {
      thumb: '#FF0000',
      index: '#0000FF',
      middle: '#00FF00',
      ring: '#FFFF00',
      pinky: '#FF00FF',
      palm: '#FFFFFF',
      connection: '#00FFFF'
    };
    
    // Landmark connections (MediaPipe hand model)
    this.connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],           // Index
      [0, 9], [9, 10], [10, 11], [11, 12],      // Middle
      [0, 13], [13, 14], [14, 15], [15, 16],    // Ring
      [0, 17], [17, 18], [18, 19], [19, 20],    // Pinky
      [5, 9], [9, 13], [13, 17]                 // Palm
    ];
    
    // Gesture label state
    this.currentGestureLabel = null;
    this.gestureLabelTimeout = null;
    
    // FPS tracking
    this.fps = 0;
  }

  /**
   * Resize canvas to match video dimensions
   * @param {number} width - Video width
   * @param {number} height - Video height
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Clear canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw hand landmarks
   * @param {Array} landmarks - Hand landmarks (21 points)
   * @param {string} handedness - 'Left' or 'Right'
   */
  drawLandmarks(landmarks, handedness) {
    if (!this.visible || !this.config.showLandmarks || !landmarks) {
      return;
    }

    const width = this.canvas.width;
    const height = this.canvas.height;

    landmarks.forEach((landmark, index) => {
      const x = landmark.x * width;
      const y = landmark.y * height;

      // Determine color based on finger
      let color = this.colors.palm;
      if (index >= 1 && index <= 4) color = this.colors.thumb;
      else if (index >= 5 && index <= 8) color = this.colors.index;
      else if (index >= 9 && index <= 12) color = this.colors.middle;
      else if (index >= 13 && index <= 16) color = this.colors.ring;
      else if (index >= 17 && index <= 20) color = this.colors.pinky;

      // Draw landmark point
      this.ctx.beginPath();
      this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      
      // Draw outline
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    });
  }

  /**
   * Draw connections between landmarks
   * @param {Array} landmarks - Hand landmarks
   */
  drawConnections(landmarks) {
    if (!this.visible || !this.config.showConnections || !landmarks) {
      return;
    }

    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.strokeStyle = this.colors.connection;
    this.ctx.lineWidth = 2;

    this.connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      if (!startPoint || !endPoint) return;

      const x1 = startPoint.x * width;
      const y1 = startPoint.y * height;
      const x2 = endPoint.x * width;
      const y2 = endPoint.y * height;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    });
  }

  /**
   * Draw bounding box around hand
   * @param {Array} landmarks - Hand landmarks
   */
  drawBoundingBox(landmarks) {
    if (!this.visible || !this.config.showBoundingBox || !landmarks) {
      return;
    }

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Calculate bounding box
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    landmarks.forEach(landmark => {
      const x = landmark.x * width;
      const y = landmark.y * height;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });

    // Draw box
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  }

  /**
   * Draw gesture label
   * @param {string} gestureName - Name of gesture
   * @param {number} confidence - Confidence score (0-1)
   * @param {Object} position - Position {x, y} (normalized 0-1)
   */
  drawGestureLabel(gestureName, confidence, position = { x: 0.5, y: 0.1 }) {
    if (!this.visible || !this.config.showLabels) {
      return;
    }

    // Store label and set timeout to clear it
    this.currentGestureLabel = { gestureName, confidence, position };
    
    if (this.gestureLabelTimeout) {
      clearTimeout(this.gestureLabelTimeout);
    }
    
    this.gestureLabelTimeout = setTimeout(() => {
      this.currentGestureLabel = null;
    }, 1000);

    this.renderGestureLabel();
  }

  /**
   * Render current gesture label
   */
  renderGestureLabel() {
    if (!this.currentGestureLabel) {
      return;
    }

    const { gestureName, confidence, position } = this.currentGestureLabel;
    const width = this.canvas.width;
    const height = this.canvas.height;

    const x = position.x * width;
    const y = position.y * height;

    // Format text
    const text = `${gestureName} (${(confidence * 100).toFixed(0)}%)`;
    
    // Measure text
    this.ctx.font = 'bold 20px Arial';
    const metrics = this.ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = 24;

    // Draw background
    const padding = 10;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(
      x - textWidth / 2 - padding,
      y - textHeight / 2 - padding,
      textWidth + padding * 2,
      textHeight + padding * 2
    );

    // Draw text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);
  }

  /**
   * Draw FPS counter
   * @param {number} fps - Current FPS
   */
  drawFPS(fps) {
    if (!this.visible || !this.config.showFPS) {
      return;
    }

    this.fps = fps;

    const text = `FPS: ${fps.toFixed(1)}`;
    const x = this.canvas.width - 10;
    const y = 30;

    // Draw background
    this.ctx.font = 'bold 16px Arial';
    const metrics = this.ctx.measureText(text);
    const padding = 8;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(
      x - metrics.width - padding * 2,
      y - 16 - padding,
      metrics.width + padding * 2,
      20 + padding * 2
    );

    // Draw text
    this.ctx.fillStyle = fps >= 25 ? '#00FF00' : '#FF0000';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, x - padding, y - padding);
  }

  /**
   * Render all visualizations
   * @param {Array} handsData - Array of hand data objects
   * @param {number} fps - Current FPS
   */
  render(handsData, fps) {
    if (!this.visible) {
      return;
    }

    // Clear canvas
    this.clear();

    // Draw each hand
    if (handsData && handsData.length > 0) {
      handsData.forEach(handData => {
        const { landmarks, handedness } = handData;
        
        // Draw connections first (behind landmarks)
        this.drawConnections(landmarks);
        
        // Draw bounding box
        this.drawBoundingBox(landmarks);
        
        // Draw landmarks on top
        this.drawLandmarks(landmarks, handedness);
      });
    }

    // Draw gesture label if exists
    if (this.currentGestureLabel) {
      this.renderGestureLabel();
    }

    // Draw FPS counter
    if (fps !== undefined) {
      this.drawFPS(fps);
    }
  }

  /**
   * Set visibility
   * @param {boolean} visible - Visibility state
   */
  setVisible(visible) {
    this.visible = visible;
    if (!visible) {
      this.clear();
    }
  }

  /**
   * Toggle visibility
   * @returns {boolean} New visibility state
   */
  toggleVisible() {
    this.visible = !this.visible;
    if (!this.visible) {
      this.clear();
    }
    return this.visible;
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.colors) {
      this.colors = { ...this.colors, ...newConfig.colors };
    }
  }
}
