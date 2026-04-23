// frontend/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// Paste YOUR specific config object from the Firebase console here:
const firebaseConfig = {
  apiKey: "AIzaSyBH9E3ntAeO8KjNasYrTQ29wua4Hxvm8FA",
  authDomain: "campuslaunch-995ae.firebaseapp.com",
  projectId: "campuslaunch-995ae",
  storageBucket: "campuslaunch-995ae.firebasestorage.app",
  messagingSenderId: "1023015602623",
  appId: "1:1023015602623:web:19bf0e2c43e666de63b90a",
  measurementId: "G-849E5CY55C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let messaging = null;

const setupMessaging = async () => {
  const supported = await isSupported();
  if (supported && typeof window !== 'undefined') {
    messaging = getMessaging(app);
  }
  return messaging;
};

export { messaging, setupMessaging, getToken, onMessage };