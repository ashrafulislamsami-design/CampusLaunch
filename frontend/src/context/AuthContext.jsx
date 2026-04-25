import { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [userTeamId, setUserTeamId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Ref to track if we've already fetched data for the current token to prevent loops
  const lastFetchedToken = useRef(null);

  // Fetch unread notification count
  const refreshUnreadCount = async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newCount = res.data.count || 0;
      setUnreadCount(newCount);
      return newCount;
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);

        // Only fetch if this is a new token session
        if (lastFetchedToken.current !== token) {
          try {
            // Fetch User details
            const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await userRes.json();
            if (!userData.message) setUser(userData);

            // Fetch user's team
            const teamRes = await fetch(`${API_BASE_URL}/teams/user/me`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const teamData = await teamRes.json();
            if (teamData && teamData.length > 0) {
              setUserTeamId(teamData[0]._id);
            } else {
              setUserTeamId(null);
            }

            // Fetch unread notification count
            await refreshUnreadCount();

            lastFetchedToken.current = token;
          } catch (err) {
            console.error('Auth initialization error:', err);
          }
        }
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserTeamId(null);
        setUser(null);
        setUnreadCount(0);
        lastFetchedToken.current = null;
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, userTeamId, setUserTeamId, user, setUser, login, logout, loading, unreadCount, setUnreadCount, refreshUnreadCount }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};