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
    console.log('🎥 CameraManager: Starting stream...');
    console.log('Config:', this.config);
    
    if (!this.isInitialized) {
      console.log('Initializing camera manager...');
      await this.initialize();
    }

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const error = 'getUserMedia is not supported in this browser. Use Chrome 90+, Firefox 88+, or Edge 90+.';
      console.error('❌', error);
      throw new Error(error);
    }

    console.log('✅ getUserMedia is supported');

    try {
      // List available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      console.log(`Found ${cameras.length} camera(s):`, cameras.map(c => c.label || 'Unknown'));

      if (cameras.length === 0) {
        throw new Error('No camera devices found. Please connect a camera.');
      }

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

      console.log('Requesting camera with constraints:', constraints);
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Camera stream obtained:', this.stream);
      
      // Attach stream to video element
      this.videoElement.srcObject = this.stream;
      console.log('✅ Stream attached to video element');
      
      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        this.videoElement.onloadedmetadata = () => {
          console.log('✅ Video metadata loaded');
          this.videoElement.play()
            .then(() => {
              console.log('✅ Video playing');
              resolve();
            })
            .catch(err => {
              console.error('❌ Video play error:', err);
              reject(err);
            });
        };
        
        // Timeout after 10 seconds
        setTimeout(() => {
          console.error('❌ Video load timeout');
          reject(new Error('Video load timeout after 10 seconds'));
        }, 10000);
      });

      console.log('✅ Camera started successfully!');
      return this.stream;
      
    } catch (error) {
      console.error('❌ Camera error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      // Handle specific error types
      if (error.name === 'NotAllowedError') {
        const msg = 'Camera permission denied. Please allow camera access in browser settings.';
        console.error('❌', msg);
        throw new Error(msg);
      } else if (error.name === 'NotFoundError') {
        const msg = 'No camera found. Please connect a camera or check if it\'s enabled.';
        console.error('❌', msg);
        throw new Error(msg);
      } else if (error.name === 'NotReadableError') {
        const msg = 'Camera is in use by another application. Please close other apps using the camera.';
        console.error('❌', msg);
        throw new Error(msg);
      } else if (error.name === 'OverconstrainedError') {
        const msg = 'Camera does not support requested resolution. Try lower resolution.';
        console.error('❌', msg);
        throw new Error(msg);
      } else {
        throw new Error(`Camera error: ${error.message}`);
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
