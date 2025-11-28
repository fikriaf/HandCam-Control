# Hand Gesture Control System

A web-based hand gesture control system using MediaPipe Hands and WebRTC for real-time hand tracking and gesture recognition. Control your computer with hand gestures detected through your webcam - no additional hardware required!

## Features

- **Real-time Hand Detection**: Detects both left and right hands simultaneously with 21 landmark points per hand
- **10 Gesture Types**: 
  - Swipe (left, right, up, down) for navigation
  - Push forward for click simulation
  - Pinch for drag & drop and volume control
  - Static gestures: OK sign, Peace sign, Open palm
- **Configurable Parameters**: Adjust thresholds, smoothing, and debouncing for optimal performance
- **Visual Feedback**: Real-time visualization of hand landmarks and detected gestures
- **Offline Mode**: Works without internet connection using bundled MediaPipe models
- **Desktop App**: Package as standalone Electron app for Windows, macOS, and Linux
- **Performance Optimized**: Runs at 30-60 FPS on mid-range hardware

## Installation

```bash
npm install
```

## Usage

### Web Mode (Development)

Start the development server:

```bash
npm start
```

Open your browser to `http://localhost:8080`

### Electron Desktop Mode

**Important**: Electron requires build first!

```bash
# Build and run Electron (recommended)
npm run electron

# Or development mode
npm run electron:dev
```

See [ELECTRON_GUIDE.md](ELECTRON_GUIDE.md) for detailed instructions.

### Production Build

Build for web deployment:

```bash
npm run build
```

Build Electron apps:

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# All platforms
npm run build:all
```

## Supported Gestures

| Gesture | Action | Description |
|---------|--------|-------------|
| Swipe Left | Next slide | Move hand quickly to the left |
| Swipe Right | Previous slide | Move hand quickly to the right |
| Swipe Up | Scroll up | Move hand quickly upward |
| Swipe Down | Scroll down | Move hand quickly downward |
| Push Forward | Click | Push hand toward camera |
| Pinch + Move | Drag & Drop | Pinch thumb and index, then move |
| Pinch + Horizontal | Volume Control | Pinch and move left/right |
| OK Sign | Open Menu | Form circle with thumb and index |
| Peace Sign | Screenshot | Extend index and middle fingers |
| Open Palm | Stop/Pause | Open all fingers wide |

## Configuration

Edit `src/js/config/gestureConfig.js` to customize gesture parameters:

```javascript
export const gestureConfig = {
  swipe: {
    velocityThreshold: 0.5,  // Adjust sensitivity
    smoothingWindow: 5,       // Smoothing frames
    debounceMs: 300          // Delay between detections
  },
  // ... more configurations
};
```

Edit `src/js/config/systemConfig.js` for system settings:

```javascript
export const systemConfig = {
  camera: {
    resolution: { width: 1280, height: 720 },
    fps: 30
  },
  mediapipe: {
    useOffline: false,  // Set true for offline mode
    maxNumHands: 2
  }
  // ... more settings
};
```

## Customizing Actions

Edit `src/js/actions/actionRegistry.js` to implement your own actions:

```javascript
export function onSwipeLeft(data) {
  // Your custom action here
  console.log('Swipe left detected!');
  // Example: Navigate to next slide
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
}
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note**: HTTPS is required for webcam access in production.

## System Requirements

- **Processor**: Intel i5 or equivalent (mid-range)
- **RAM**: 8GB minimum
- **Webcam**: Any standard webcam (720p recommended)
- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+

## Troubleshooting

### Camera Permission Denied
- Check browser settings to allow camera access
- Ensure no other application is using the camera

### Low FPS / Performance Issues (Especially Electron)
- **Enable GPU**: Comment out `app.disableHardwareAcceleration()` in `electron/main.js`
- **Use Low Mode**: Change to `PERFORMANCE_MODES.LOW` in `electronConfig.js`
- Reduce camera resolution in `systemConfig.js`
- Close other resource-intensive applications
- Disable visualization overlay for better performance
- **See [PERFORMANCE_GUIDE.md](PERFORMANCE_GUIDE.md) for detailed optimization**

### MediaPipe Model Loading Failed
- Check internet connection (online mode)
- Download model manually and enable offline mode
- Clear browser cache and reload

### Gestures Not Detected
- Ensure good lighting conditions
- Keep hand within camera frame
- Adjust gesture thresholds in configuration
- Check that hands are clearly visible (no gloves)

## Development

### Project Structure

```
src/
├── index.html              # Main HTML
├── styles/main.css         # Styling
├── js/
│   ├── main.js            # Application entry
│   ├── config/            # Configuration files
│   ├── core/              # Core modules (Camera, MediaPipe, EventBus)
│   ├── detection/         # Hand detection and landmark processing
│   ├── recognition/       # Gesture detectors and filters
│   ├── actions/           # Action handlers
│   └── ui/                # UI and visualization
├── models/                # MediaPipe models (offline)
└── electron/              # Electron wrapper
```

### Adding New Gestures

See `DEVELOPER_GUIDE.md` for detailed instructions on adding custom gestures.

## Testing

Run tests:

```bash
npm test
```

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [MediaPipe](https://mediapipe.dev/) by Google for hand tracking
- [Electron](https://www.electronjs.org/) for desktop app framework

## Support

For issues and questions, please open an issue on GitHub.
