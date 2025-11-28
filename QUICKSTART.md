# Quick Start Guide

Get up and running with Hand Gesture Control System in 5 minutes!

## Prerequisites

- Node.js 16+ and npm
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Webcam

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/hand-gesture-control.git
cd hand-gesture-control

# Install dependencies
npm install
```

## Running the App

### Web Mode (Recommended for Development)

```bash
npm start
```

This will:
1. Start the webpack dev server
2. Open your browser to http://localhost:8080
3. The app is ready to use!

### First Time Usage

1. Click **"Start Camera"** button
2. Allow camera access when prompted
3. Show your hand to the camera
4. Try the gestures:
   - **Swipe left/right**: Move hand quickly horizontally
   - **Open palm**: Spread all fingers wide
   - **OK sign**: Touch thumb and index finger

## Testing Gestures

### Easy Gestures to Start With:

1. **Open Palm** (Easiest)
   - Open all fingers wide
   - Hold for 1 second
   - You should see "Open Palm" label

2. **Swipe Left** (Easy)
   - Move hand quickly to the left
   - Check the gesture log for confirmation

3. **Peace Sign** (Medium)
   - Extend index and middle fingers
   - Keep other fingers closed
   - Hold for 1 second

## Troubleshooting

### Camera Not Working?
- Check browser permissions
- Ensure no other app is using the camera
- Try refreshing the page

### Gestures Not Detected?
- Ensure good lighting
- Keep hand within camera frame
- Move more deliberately
- Check gesture log for feedback

### Low FPS?
- Close other applications
- Reduce camera resolution in config
- Disable visualization overlay

## Next Steps

- Read [GESTURE_GUIDE.md](GESTURE_GUIDE.md) for all gestures
- Customize actions in `src/js/actions/actionRegistry.js`
- Adjust thresholds in `src/js/config/gestureConfig.js`
- Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) to add custom gestures

## Building for Production

```bash
# Build web app
npm run build

# Build Electron app (Windows)
npm run build:win

# Build Electron app (macOS)
npm run build:mac

# Build Electron app (Linux)
npm run build:linux
```

## Need Help?

- Check [README.md](README.md) for detailed documentation
- Open an issue on GitHub
- Read the troubleshooting section

## Tips for Best Experience

1. **Lighting**: Use good, even lighting
2. **Distance**: Keep 50-100cm from camera
3. **Background**: Use plain background
4. **Practice**: Try each gesture a few times
5. **Patience**: Wait for visual feedback

Enjoy controlling your computer with hand gestures! 🖐️
