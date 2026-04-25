import { useEffect, useRef } from 'react';
import { useContext } from 'react';
import { setupMessaging, getToken, onMessage } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const VAPID_KEY = 'BBbWTBsBpH3KmooqTG1sgFMLmHDchn9nSLvA46L4X2o88sYdVA5YZIoyz8Jtj9igo-ICjZkC2JIDKFTUS3BvnvE';

const NotificationHandler = () => {
  const { isAuthenticated } = useContext(AuthContext);
  // Guard to prevent double-execution during React StrictMode or re-renders
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hasRequested.current = false;
      return;
    }

    // Only request permission if the user is logged in and we haven't asked yet
    if (hasRequested.current) return;

    const requestPermissionAndSaveToken = async () => {
      hasRequested.current = true; // Mark as started immediately
      
      try {
        if (typeof Notification === 'undefined') {
          return;
        }
        console.log('🔔 NotificationHandler: Requesting permission...');
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
          console.log('Notification permission denied.');
          return;
        }

        console.log('✅ Permission granted. Getting FCM token...');
        const messaging = await setupMessaging();
        if (!messaging) return;
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });

        if (token) {
          console.log('FCM Device Token obtained:', token);
          const authToken = localStorage.getItem('token');
          
          await axios.put(
            `${API_BASE_URL}/notifications/update-token`,
            { token },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          console.log('FCM token successfully saved to backend.');
        } else {
          console.log('No FCM token available. Check service worker registration.');
        }
      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    };

    requestPermissionAndSaveToken();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let unsubscribe = null;
    const registerListener = async () => {
      const messaging = await setupMessaging();
      if (!messaging) return;
      unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        if (payload.notification) {
          showToast(payload.notification.title, payload.notification.body);
        }
      });
    };

    registerListener();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isAuthenticated]);

  return null;
};

// Simple in-app toast for foreground notifications
function showToast(title, body) {
  // Check if a toast container already exists to prevent stacking
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;`;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: #1c1917; color: #fef3c7; padding: 16px 20px;
    border-radius: 12px; border-left: 4px solid #f59e0b;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3); max-width: 320px;
    font-family: sans-serif; animation: slideIn 0.3s ease;
    cursor: pointer;
  `;
  toast.innerHTML = `
    <div style="font-weight:bold;font-size:14px;margin-bottom:4px">${title}</div>
    <div style="font-size:13px;opacity:0.85">${body}</div>
  `;
  
  toast.onclick = () => toast.remove();
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}

export default NotificationHandler;