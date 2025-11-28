# MediaPipe Models Directory

This directory is for storing MediaPipe hand tracking models for offline use.

## Download Model

To enable offline mode, download the MediaPipe hand landmarker model:

**Model**: hand_landmarker.task  
**Size**: ~9MB  
**URL**: https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task

### Steps:

1. Download the model file from the URL above
2. Place it in this directory (`src/models/hand_landmarker.task`)
3. Enable offline mode in `src/js/config/systemConfig.js`:

```javascript
mediapipe: {
  useOffline: true,
  offlineModelPath: './models/hand_landmarker.task'
}
```

## Note

The model file is not included in the repository due to its size. It will be downloaded automatically when using online mode, or you can download it manually for offline use.

## Model Information

- **Type**: Hand Landmarker
- **Format**: TensorFlow Lite (.task)
- **Precision**: Float16
- **Version**: 1
- **Landmarks**: 21 points per hand
- **Max Hands**: Configurable (default: 2)

## License

The MediaPipe models are provided by Google under the Apache License 2.0.
