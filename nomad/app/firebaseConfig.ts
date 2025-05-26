// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getFirestore } from "firebase/firestore";
// Make sure to install and configure 'react-native-dotenv' or use process.env if supported
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY as string;
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: GOOGLE_MAPS_API_KEY,
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
const analytics = getAnalytics(app);

export const db = getFirestore(app);
