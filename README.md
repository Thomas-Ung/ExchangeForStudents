# ExchangeForStudents App

This is an [Expo](https://expo.dev) project for the ExchangeForStudents app, created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app). The app allows students to browse, post, and exchange items.

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Thomas-Ung/ExchangeForStudents.git
   cd ExchangeForStudents/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Running the Project

1. Start the Expo development server:

   ```bash
   npx expo start
   ```

2. Open the app on your device:

   - Use the QR code in the terminal or browser to open the app in the [Expo Go](https://expo.dev/go) app on your phone.
   - Alternatively, run the app on an emulator:
     - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
     - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

## Firebase Configuration

This project uses Firebase for authentication and Firestore for the database. Ensure you have a `firebaseConfig.js` file in the `frontend` directory with your Firebase project configuration:

```javascript
// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```
