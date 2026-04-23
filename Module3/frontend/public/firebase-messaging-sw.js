// frontend/public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBH9E3ntAeO8KjNasYrTQ29wua4Hxvm8FA",
  authDomain: "campuslaunch-995ae.firebaseapp.com",
  projectId: "campuslaunch-995ae",
  storageBucket: "campuslaunch-995ae.firebasestorage.app",
  messagingSenderId: "1023015602623",
  appId: "1:1023015602623:web:19bf0e2c43e666de63b90a",
  measurementId: "G-849E5CY55C"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// This handles background notifications (when the app tab is not active)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
