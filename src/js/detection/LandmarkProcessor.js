// Landmark processor for hand landmark calculations
export class LandmarkProcessor {
  constructor() {
    // MediaPipe hand landmark indices
    this.LANDMARK_INDICES = {
      WRIST: 0,
      THUMB_CMC: 1,
      THUMB_MCP: 2,
      THUMB_IP: 3,
      THUMB_TIP: 4,
      INDEX_MCP: 5,
      INDEX_PIP: 6,
      INDEX_DIP: 7,
      INDEX_TIP: 8,
      MIDDLE_MCP: 9,
      MIDDLE_PIP: 10,
      MIDDLE_DIP: 11,
      MIDDLE_TIP: 12,
      RING_MCP: 13,
      RING_PIP: 14,
      RING_DIP: 15,
      RING_TIP: 16,
      PINKY_MCP: 17,
      PINKY_PIP: 18,
      PINKY_DIP: 19,
      PINKY_TIP: 20
    };
  }

  /**
   * Normalize landmarks to 0-1 range
   * @param {Array} landmarks - Raw landmarks from MediaPipe
   * @param {number} imageWidth - Image width
   * @param {number} imageHeight - Image height
   * @returns {Array} Normalized landmarks
   */
  normalizeLandmarks(landmarks, imageWidth, imageHeight) {
    if (!landmarks || landmarks.length === 0) {
      return [];
    }

    return landmarks.map(landmark => ({
      x: landmark.x,  // Already normalized by MediaPipe
      y: landmark.y,  // Already normalized by MediaPipe
      z: landmark.z,  // Relative depth
      visibility: landmark.visibility || 1.0
    }));
  }

  /**
   * Calculate Euclidean distance between two points
   * @param {Object} point1 - First point {x, y, z}
   * @param {Object} point2 - Second point {x, y, z}
   * @param {boolean} use3D - Include z coordinate
   * @returns {number} Distance
   */
  calculateDistance(point1, point2, use3D = false) {
    if (!point1 || !point2) {
      return 0;
    }

    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    
    if (use3D && point1.z !== undefined && point2.z !== undefined) {
      const dz = point2.z - point1.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate velocity from landmark changes
   * @param {Array} currentLandmarks - Current frame landmarks
   * @param {Array} previousLandmarks - Previous frame landmarks
   * @param {number} deltaTime - Time difference in seconds
   * @returns {Object} Velocity {x, y, magnitude}
   */
  calculateVelocity(currentLandmarks, previousLandmarks, deltaTime) {
    if (!currentLandmarks || !previousLandmarks || deltaTime === 0) {
      return { x: 0, y: 0, magnitude: 0 };
    }

    // Use wrist (index 0) for velocity calculation
    const current = currentLandmarks[0];
    const previous = previousLandmarks[0];

    if (!current || !previous) {
      return { x: 0, y: 0, magnitude: 0 };
    }

    const vx = (current.x - previous.x) / deltaTime;
    const vy = (current.y - previous.y) / deltaTime;
    const magnitude = Math.sqrt(vx * vx + vy * vy);

    return { x: vx, y: vy, magnitude };
  }

  /**
   * Get bounding box of hand landmarks
   * @param {Array} landmarks - Hand landmarks
   * @returns {Object} Bounding box {minX, minY, maxX, maxY, width, height, area}
   */
  getBoundingBox(landmarks) {
    if (!landmarks || landmarks.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, area: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    landmarks.forEach(landmark => {
      minX = Math.min(minX, landmark.x);
      minY = Math.min(minY, landmark.y);
      maxX = Math.max(maxX, landmark.x);
      maxY = Math.max(maxY, landmark.y);
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const area = width * height;

    return { minX, minY, maxX, maxY, width, height, area };
  }

  /**
   * Detect finger states (extended/bent)
   * @param {Array} landmarks - Hand landmarks
   * @returns {Object} Finger states {thumb, index, middle, ring, pinky}
   */
  getFingerStates(landmarks) {
    if (!landmarks || landmarks.length < 21) {
      return {
        thumb: false,
        index: false,
        middle: false,
        ring: false,
        pinky: false
      };
    }

    const wrist = landmarks[this.LANDMARK_INDICES.WRIST];

    // Check if finger tip is farther from wrist than PIP joint
    const isFingerExtended = (tipIndex, pipIndex) => {
      const tip = landmarks[tipIndex];
      const pip = landmarks[pipIndex];
      
      const tipDist = this.calculateDistance(wrist, tip);
      const pipDist = this.calculateDistance(wrist, pip);
      
      return tipDist > pipDist * 1.1; // 10% threshold
    };

    // Thumb is special - check if tip is farther from wrist than IP joint
    const thumbTip = landmarks[this.LANDMARK_INDICES.THUMB_TIP];
    const thumbIP = landmarks[this.LANDMARK_INDICES.THUMB_IP];
    const thumbDist = this.calculateDistance(wrist, thumbTip);
    const thumbIPDist = this.calculateDistance(wrist, thumbIP);

    return {
      thumb: thumbDist > thumbIPDist * 1.1,
      index: isFingerExtended(this.LANDMARK_INDICES.INDEX_TIP, this.LANDMARK_INDICES.INDEX_PIP),
      middle: isFingerExtended(this.LANDMARK_INDICES.MIDDLE_TIP, this.LANDMARK_INDICES.MIDDLE_PIP),
      ring: isFingerExtended(this.LANDMARK_INDICES.RING_TIP, this.LANDMARK_INDICES.RING_PIP),
      pinky: isFingerExtended(this.LANDMARK_INDICES.PINKY_TIP, this.LANDMARK_INDICES.PINKY_PIP)
    };
  }

  /**
   * Get center point of hand
   * @param {Array} landmarks - Hand landmarks
   * @returns {Object} Center point {x, y}
   */
  getCenterPoint(landmarks) {
    if (!landmarks || landmarks.length === 0) {
      return { x: 0, y: 0 };
    }

    let sumX = 0;
    let sumY = 0;

    landmarks.forEach(landmark => {
      sumX += landmark.x;
      sumY += landmark.y;
    });

    return {
      x: sumX / landmarks.length,
      y: sumY / landmarks.length
    };
  }

  /**
   * Calculate angle between three points
   * @param {Object} point1 - First point
   * @param {Object} point2 - Middle point (vertex)
   * @param {Object} point3 - Third point
   * @returns {number} Angle in degrees
   */
  calculateAngle(point1, point2, point3) {
    const v1 = { x: point1.x - point2.x, y: point1.y - point2.y };
    const v2 = { x: point3.x - point2.x, y: point3.y - point2.y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 === 0 || mag2 === 0) {
      return 0;
    }

    const cosAngle = dot / (mag1 * mag2);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    
    return angle * (180 / Math.PI);
  }

  /**
   * Check if fingers are spread apart
   * @param {Array} landmarks - Hand landmarks
   * @returns {boolean} True if fingers are spread
   */
  areFingersSpread(landmarks) {
    if (!landmarks || landmarks.length < 21) {
      return false;
    }

    const fingerTips = [
      landmarks[this.LANDMARK_INDICES.INDEX_TIP],
      landmarks[this.LANDMARK_INDICES.MIDDLE_TIP],
      landmarks[this.LANDMARK_INDICES.RING_TIP],
      landmarks[this.LANDMARK_INDICES.PINKY_TIP]
    ];

    // Calculate average distance between adjacent finger tips
    let totalDistance = 0;
    for (let i = 0; i < fingerTips.length - 1; i++) {
      totalDistance += this.calculateDistance(fingerTips[i], fingerTips[i + 1]);
    }
    const avgDistance = totalDistance / (fingerTips.length - 1);

    // Fingers are spread if average distance > threshold
    return avgDistance > 0.1;
  }
}
