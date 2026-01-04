# PhyLab - Platform Pembelajaran Fisika Interaktif

Aplikasi pembelajaran fisika interaktif dengan simulasi lab virtual untuk mahasiswa TPB

## Struktur Folder

```
PhyLab/
├── web/                    # Web Application
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Stylesheet
│   ├── js/
│   │   ├── config.js       # Firebase configuration
│   │   ├── data.js         # Quiz & materi data
│   │   ├── firebase.js     # Firebase services
│   │   ├── simulations.js  # Canvas simulations
│   │   └── app.js          # Main application logic
│   └── assets/
│       └── logo.png        # App logo
│
└── mobile/                 # React Native (Expo) App
    ├── app/                # Expo Router screens
    │   ├── _layout.tsx     # Tab navigation
    │   ├── index.tsx       # Home screen
    │   ├── materi.tsx      # Materi & quiz
    │   ├── lab.tsx         # Virtual lab
    │   ├── diskusi.tsx     # Discussion forum
    │   └── profil.tsx      # User profile
    ├── src/
    │   ├── constants/      # App constants
    │   ├── services/       # Firebase services
    │   └── components/     # Reusable components
    ├── assets/             # Images & icons
    ├── app.json            # Expo config
    ├── package.json        # Dependencies
    └── tsconfig.json       # TypeScript config
```

## Fitur

- **Materi Pembelajaran** - 7 modul fisika dengan video YouTube
- **Kuis Interaktif** - Evaluasi pemahaman tiap modul
- **Mini Lab** - Simulasi virtual (jatuh bebas, gerak proyektil, pendulum)
- **Forum Diskusi** - Tanya jawab antar pengguna
- **Autentikasi** - Login dengan email verification

## Web Development

### Run Locally
```bash
cd web
npx serve .
```
Buka http://localhost:3000 di browser.

## Mobile Development

### Installation
```bash
cd mobile
npm install
```

### Run Development
```bash
npx expo start
```
Scan QR code dengan Expo Go (Android/iOS).

## Build APK

### Option 1: EAS Build (Recommended)
```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

### Option 2: Local Build
```bash
cd mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```
APK di `android/app/build/outputs/apk/release/`

## Tech Stack

**Web:** Vanilla HTML, CSS, JavaScript, Firebase SDK (CDN)

**Mobile:** React Native 0.76, Expo SDK 52, Expo Router v4, TypeScript, Firebase 10.x
