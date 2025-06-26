# Nomad

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) or [npm](https://www.npmjs.com/get-npm)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/nomad.git
   cd nomad/nomad
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Install Expo dependencies:**
   ```bash
   npx expo install
   ```

4. **(Optional) Configure environment variables:**
   - If you use a `.env` file for Firebase or API keys, copy `.env.example` to `.env` and fill in your values.

### Running the App

1. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

2. **Open the app:**
   - Use the QR code in your terminal or browser to open the app on your phone with the [Expo Go](https://expo.dev/client) app.
   - Or, press `i` to open in iOS Simulator, `a` for Android Emulator (requires setup).

### Additional Notes

- If you make native changes (i.e., in `ios/` or `android/`), run:
  ```bash
  npx expo prebuild
  ```
- For iOS, you may need to run `cd ios && pod install` after installing dependencies.

---

**Troubleshooting:**  
- If you encounter issues, try clearing the Expo cache:
  ```bash
  npx expo start -c
  ```

---

Enjoy using Nomad!
