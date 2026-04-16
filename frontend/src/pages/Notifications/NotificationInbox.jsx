// frontend/src/pages/Notifications/NotificationInbox.jsx
import React, { useEffect, useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
  Bell, Users, Calendar, Trophy, Briefcase, BookOpen,
  CheckCheck, Check, Inbox, Settings, X, ToggleLeft, ToggleRight
} from 'lucide-react';

const API = 'http://localhost:5000/api';

// Map notification types to icons and color classes
const TYPE_CONFIG = {
  MATCH: {
    icon: <Users size={18} />,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    label: 'Co-Founder Match',
  },
  MENTOR: {
    icon: <Calendar size={18} />,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    label: 'Mentor Session',
  },
  EVENT: {
    icon: <Trophy size={18} />,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-amber-400',
    label: 'Pitch Event',
  },
  TEAM_UPDATE: {
    icon: <Briefcase size={18} />,
    color: 'text-teal-600',
    bg: 'bg-teal-100',
    border: 'border-teal-400',
    label: 'Team Update',
  },
  FUNDING: {
    icon: <Bell size={18} />,
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-400',
    label: 'Funding Alert',
  },
  COURSE: {
    icon: <BookOpen size={18} />,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
    border: 'border-rose-400',
    label: 'Course Update',
  },
};

const SETTINGS_META = [
  { key: 'coFounderMatches', label: 'Co-Founder Matches', type: 'MATCH' },
  { key: 'mentorSessions', label: 'Mentor Sessions', type: 'MENTOR' },
  { key: 'pitchEvents', label: 'Pitch Events & Deadlines', type: 'EVENT' },
  { key: 'teamUpdates', label: 'Team Activity', type: 'TEAM_UPDATE' },
  { key: 'fundingAlerts', label: 'Funding Closing Alerts', type: 'FUNDING' },
  { key: 'courseUpdates', label: 'New Course Weeks', type: 'COURSE' },
];

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const NotificationInbox = () => {
  const { refreshUnreadCount } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    coFounderMatches: true,
    mentorSessions: true,
    pitchEvents: true,
    teamUpdates: true,
    fundingAlerts: true,
    courseUpdates: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/notifications`, authHeaders());
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/notifications/settings`, authHeaders());
      if (res?.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Error fetching notification settings', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, [fetchNotifications, fetchSettings]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/notifications/read/${id}`, {}, authHeaders());
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      // Update badge count in navbar - with small delay to ensure backend sync
      setTimeout(() => refreshUnreadCount(), 100);
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API}/notifications/read-all`, {}, authHeaders());
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      // Update badge count in navbar - with small delay to ensure backend sync
      setTimeout(() => refreshUnreadCount(), 100);
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await axios.put(
        `${API}/notifications/settings`,
        { notificationSettings: settings },
        authHeaders()
      );
      setShowSettings(false);
    } catch (err) {
      console.error('Error saving settings', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered =
    activeFilter === 'ALL'
      ? notifications
      : activeFilter === 'UNREAD'
      ? notifications.filter((n) => !n.isRead)
      : notifications.filter((n) => n.type === activeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-stone-400">
          <Bell size={40} className="animate-bounce text-amber-400" />
          <p className="font-semibold">Loading your alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-stone-800 font-serif-custom flex items-center gap-3">
            <Bell className="text-amber-500" size={30} />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-amber-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-stone-500 text-sm mt-1">Your alerts and activity updates</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-700 border border-teal-300 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg transition"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-stone-600 border border-stone-200 bg-white hover:bg-stone-50 px-3 py-2 rounded-lg transition"
          >
            <Settings size={14} />
            Settings
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {['ALL', 'UNREAD', 'MATCH', 'MENTOR', 'EVENT', 'TEAM_UPDATE', 'FUNDING', 'COURSE'].map((f) => {
          const cfg = TYPE_CONFIG[f];
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition ${
                activeFilter === f
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
              }`}
            >
              {cfg ? cfg.label : f === 'UNREAD' ? `Unread (${unreadCount})` : 'All'}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-stone-400 gap-4">
          <Inbox size={56} strokeWidth={1.2} className="text-stone-300" />
          <p className="font-semibold text-lg">Nothing here yet</p>
          <p className="text-sm">We'll alert you when something important happens.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG['TEAM_UPDATE'];
            return (
              <div
                key={n._id}
                className={`flex gap-4 p-4 rounded-xl border-l-4 shadow-sm transition-all ${
                  n.isRead
                    ? `bg-white border-gray-200`
                    : `bg-amber-50 ${cfg.border}`
                }`}
              >
                {/* Type icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${cfg.bg} ${cfg.color}`}
                >
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`font-bold text-sm ${n.isRead ? 'text-stone-600' : 'text-stone-900'}`}>
                        {n.title}
                      </p>
                      <p className="text-stone-500 text-sm mt-0.5 leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-stone-400">
                          {new Date(n.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        title="Mark as read"
                        className="flex-shrink-0 text-teal-600 hover:text-teal-800 transition"
                      >
                        <Check size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-stone-100">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
              <h2 className="text-lg font-black text-stone-800">Notification Preferences</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-stone-400 hover:text-stone-700 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-stone-500">
                Choose which types of notifications you want to receive as push alerts.
              </p>
              {SETTINGS_META.map(({ key, label, type }) => {
                const cfg = TYPE_CONFIG[type];
                const enabled = settings[key];
                return (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      <span className="text-sm font-semibold text-stone-700">{label}</span>
                    </div>
                    <button
                      onClick={() => setSettings((prev) => ({ ...prev, [key]: !prev[key] }))}
                      className={`transition ${enabled ? 'text-teal-600' : 'text-stone-300'}`}
                    >
                      {enabled ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
              >
                {savingSettings ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationInbox;
