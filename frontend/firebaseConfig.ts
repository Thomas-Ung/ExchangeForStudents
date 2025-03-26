import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZmQazUOyvkn7bJh8-fIwBtVIBG60jgMQ",
  authDomain: "exchange-for-students.firebaseapp.com",
  projectId: "exchange-for-students",
  storageBucket: "exchange-for-students.firebasestorage.app",
  messagingSenderId: "1041103830112",
  appId: "1:1041103830112:web:1357200950a34f945ed705",
  measurementId: "G-GR6WG4GT8K",
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase has been initialized.");
} else {
  app = getApp();
  console.log("Firebase app already initialized.");
}

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);