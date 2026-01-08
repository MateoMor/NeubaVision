# NeubaVision

## AI-Powered Cell Counter for Neubauer Chambers

This project is a **mobile application** built to demonstrate how to **automate cell counting in Neubauer hemocytometer chambers using on-device AI**.  
It serves as an **open-source production-ready tool** and showcases how to:

- 📱 Build cross-platform mobile apps with **Expo SDK 54** and **React Native**
- 🤖 Run **YOLO object detection models** on-device with **TensorFlow Lite**
- 📷 Capture and process images using **react-native-vision-camera**
- 🔬 Perform **Neubauer chamber calculations** (cells/mL concentration)
- 🌙 Support **dark/light themes** with a modern, polished UI
- 🌍 Internationalization (**English & Spanish**) with i18next

## Features

| Feature                      | Description                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| **Camera with Grid Overlay** | Live camera feed with customizable Neubauer grid overlay for precise cell alignment |
| **AI Cell Detection**        | On-device YOLO inference using TFLite for real-time cell detection                  |
| **Photo Gallery**            | Review captured images with detected bounding boxes and manual count adjustments    |
| **Concentration Calculator** | Automatic cells/mL calculation based on dilution factor and chamber dimensions      |
| **Settings Panel**           | Configure dilution factors, model parameters, and appearance preferences            |
| **Multi-language Support**   | Full English and Spanish translations                                               |

## Project Structure

```
NeubaVision/
├── NeubaVision-APP/          # React Native / Expo mobile application
│   ├── app/                  # Expo Router screens (tabs)
│   ├── components/           # UI components organized by feature
│   ├── hooks/                # Custom React hooks (inference, camera, etc.)
│   ├── store/                # Zustand state management
│   ├── i18n/                 # Internationalization (en, es)
│   └── assets/model/         # TFLite model file
│
└── experiments/              # ML experiments and training
    ├── notebooks/            # Jupyter notebooks for model training
    ├── dataset/              # Training data (images, annotations)
    ├── src/                  # Vision tools and utilities
    └── tests/                # Python tests
```

## How to Install NeubaVision

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android) or Xcode (for iOS)
- EAS CLI for builds (`npm install -g eas-cli`)

### Installation Steps

1. **Clone this repository**

   ```bash
   git clone https://github.com/MateoMor/NeubaVision.git
   cd NeubaVision/NeubaVision-APP
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Add your TFLite model** (if training your own)

   ```
   Place your trained model at: assets/model/best_float16.tflite
   ```

4. **Run in development mode**

   ```bash
   # For development build (required for camera & TFLite)
   npx expo run:android
   # or
   npx expo run:ios
   ```

5. **Build for production**
   ```bash
   eas build -p android --profile preview
   eas build -p ios --profile preview
   ```

## Tech Stack

| Category             | Technology                              |
| -------------------- | --------------------------------------- |
| **Framework**        | React Native 0.81 + Expo SDK 54         |
| **Styling**          | NativeWind (TailwindCSS) + Gluestack UI |
| **State Management** | Zustand                                 |
| **AI/ML**            | react-native-fast-tflite (YOLO)         |
| **Camera**           | react-native-vision-camera              |
| **Animations**       | react-native-reanimated                 |
| **i18n**             | i18next + react-i18next                 |
| **Navigation**       | Expo Router                             |

## How to Customize This Project

This project is designed to be reusable.  
You can fork or clone it and adapt it to your own needs by:

- 🔧 **Training your own model**: Use the notebooks in `experiments/` to train a custom YOLO model for different cell types
- 🎨 **Customizing the theme**: Edit `constants/theme.ts` to change colors for light/dark modes
- 🌍 **Adding languages**: Add new translation files in `i18n/` directory
- 📐 **Modifying grid configuration**: Adjust `GRID_CONFIG` in `camera.tsx` for different chamber layouts
- ⚙️ **Adjusting calculations**: Modify `useNeubauerCalculationsStore.ts` for different chamber specifications

It works well as a starter boilerplate for **medical imaging apps, laboratory automation tools, or any on-device ML application**.

## Training Your Own Model

The `experiments/` folder contains everything needed to train a custom cell detection model:

1. **Prepare your dataset** in `experiments/dataset/`
2. **Run training notebooks** in `experiments/notebooks/`
3. **Export to TFLite** (float16 recommended for mobile)
4. **Replace** `assets/model/best_float16.tflite`

## Found a Bug or Want to Contribute?

If you find an issue or have a suggestion for improvement:

- Open an issue using the **Issues** tab
- If submitting a PR, please reference the related issue

Contributions are welcome 🚀

## Known Issues / Limitations

This project is still under active development.  
Current known limitations include:

- ⚠️ **iOS builds** may require additional configuration for camera permissions
- ⚠️ **Model accuracy** depends on image quality and proper chamber alignment
- 🔄 **Real-time detection** is not yet implemented (inference runs on captured photos)
- 📱 **Expo Go** does not support TFLite or Vision Camera (development build required)

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

© 2025 Mateo Morales
