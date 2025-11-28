// Camera manager for webcam access using WebRTC
export class CameraManager {
  constructor(config) {
    this.config = config;
    this.videoElement = null;
    this.stream = null;
    this.isInitialized = false;
  }

  /**
   * Initialize camera manager and create video element
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    // Create video element if not exists
    this.videoElement = document.getElementById('webcam');
    
    if (!this.videoElement) {
      throw new Error('Video element with id "webcam" not found');
    }

    this.isInitialized = true;
  }

  /**
   * Start video stream from webcam
   * @returns {Promise<MediaStream>}
   */
  async startStream() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported in this browser');
    }

    try {
      // Request camera access with constraints
      const constraints = {
        video: {
          width: { ideal: this.config.resolution.width },
          height: { ideal: this.config.resolution.height },
          frameRate: { ideal: this.config.fps },
          facingMode: this.config.facingMode
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Attach stream to video element
      this.videoElement.srcObject = this.stream;
      
      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play()
            .then(resolve)
            .catch(reject);
        };
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Video load timeout')), 5000);
      });

      return this.stream;
      
    } catch (error) {
      // Handle specific error types
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera permission denied by user');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera device found');
      } else if (error.name === 'NotReadableError') {
        throw new Error('Camera is already in use by another application');
      } else {
        throw new Error(`Camera access error: ${error.message}`);
      }
    }
  }

  /**
   * Stop video stream and release resources
   */
  stopStream() {
    if (this.stream) {
      // Stop all tracks
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Get video element
   * @returns {HTMLVideoElement}
   */
  getVideoElement() {
    return this.videoElement;
  }

  /**
   * Get actual stream dimensions
   * @returns {{width: number, height: number}}
   */
  getStreamDimensions() {
    if (!this.videoElement) {
      return { width: 0, height: 0 };
    }

    return {
      width: this.videoElement.videoWidth,
      height: this.videoElement.videoHeight
    };
  }

  /**
   * Check if camera is active
   * @returns {boolean}
   */
  isActive() {
    return this.stream !== null && this.stream.active;
  }

  /**
   * Get available camera devices
   * @returns {Promise<MediaDeviceInfo[]>}
   */
  static async getAvailableDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return [];
    }
  }
}
