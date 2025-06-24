// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

// Make sure to install and configure 'react-native-dotenv' or use process.env if supported
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY as string;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY as string;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY || "AIzaSyB8gV9H3xJ9VQ2K_9lN4nZ2Xm8P6pR5tY7",
  authDomain: "nomad-832ea.firebaseapp.com",
  projectId: "nomad-832ea",
  storageBucket: "nomad-832ea.appspot.com",
  messagingSenderId: "461842977346",
  appId: "1:461842977346:web:e636617078c2d3ebe7d3db",
  measurementId: "G-2KQP2KSQFC",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics only if supported and on web platform
let analytics: any = null;
if (Platform.OS === 'web') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export const db = getFirestore(app);
export { analytics };
