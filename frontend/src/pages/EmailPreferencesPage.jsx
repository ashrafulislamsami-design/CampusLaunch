import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  getEmailPreferences,
  updateEmailPreferences,
  resetEmailPreferences,
} from '../services/emailService';
import EmailPreferenceCategory from '../components/email/EmailPreferenceCategory';
import EmailPreferenceToggle from '../components/email/EmailPreferenceToggle';
import EmailLogSection from '../components/email/EmailLogSection';

const CATEGORIES = [
  {
    key: 'coFounderMatches',
    icon: '🤝',
    title: 'Co-Founder Matches',
    description: 'Connection requests and acceptances from potential co-founders.',
  },
  {
    key: 'mentorSessions',
    icon: '📅',
    title: 'Mentor Sessions',
    description: 'Booking confirmations, 24h & 1h reminders, and post-session feedback requests.',
  },
  {
    key: 'pitchEvents',
    icon: '🎤',
    title: 'Pitch Events',
    description: 'Registration confirmations, 2-day reminders, and event results.',
  },
  {
    key: 'fundingOpportunities',
    icon: '💰',
    title: 'Funding Opportunities',
    description: 'Deadline reminders for funding in your watchlist (7-day and 3-day).',
  },
  {
    key: 'curriculumProgress',
    icon: '📚',
    title: 'Curriculum Progress',
    description: 'New week unlocked notifications and completion certificates.',
  },
  {
    key: 'teamCanvasUpdates',
    icon: '🎨',
    title: 'Team Canvas Updates',
    description: 'When teammates save new versions of your Business Model Canvas.',
  },
];

const EmailPreferencesPage = () => {
  const [pref, setPref] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await getEmailPreferences();
      setPref(data);
    } catch {
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const mergeCategory = (key, patch) => {
    setPref((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: { ...prev.preferences[key], ...patch },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateEmailPreferences({
        preferences: pref.preferences,
        unsubscribedAll: pref.unsubscribedAll,
      });
      setPref(updated);
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all email preferences to defaults?')) return;
    setSaving(true);
    try {
      const reset = await resetEmailPreferences();
      setPref(reset);
      toast.success('Preferences reset to defaults');
    } catch {
      toast.error('Failed to reset preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-stone-400 font-semibold">
        Loading preferences…
      </div>
    );
  }

  if (!pref) return null;

  const isUnsubscribed = !!pref.unsubscribedAll;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Email Preferences
        </h1>
        <p className="text-stone-500 mt-1">
          Choose which emails you receive from CampusLaunch.
        </p>
      </div>

      {/* Master unsubscribe toggle */}
      <div
        className={`
          rounded-xl border-2 p-5 mb-6 flex items-start justify-between gap-4
          ${isUnsubscribed ? 'bg-red-50 border-red-300' : 'bg-white border-stone-200'}
        `}
      >
        <div>
          <h2 className="font-bold text-stone-900 flex items-center gap-2">
            ⚠️ Unsubscribe from all emails
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            You'll still receive essential transactional emails (like password
            resets). Everything else — including session reminders and digests —
            will be paused.
          </p>
        </div>
        <EmailPreferenceToggle
          enabled={isUnsubscribed}
          onChange={(val) => setPref((p) => ({ ...p, unsubscribedAll: val }))}
        />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {CATEGORIES.map(({ key, icon, title, description }) => {
          const cat = pref.preferences?.[key] || { enabled: true, frequency: 'immediate' };
          return (
            <EmailPreferenceCategory
              key={key}
              icon={icon}
              title={title}
              description={description}
              enabled={!!cat.enabled}
              disabled={isUnsubscribed}
              onToggle={(val) => mergeCategory(key, { enabled: val })}
            >
              <div className="flex items-center gap-3 text-sm">
                <span className="text-stone-600 min-w-[80px]">Frequency:</span>
                {['immediate', 'daily', 'off'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => mergeCategory(key, { frequency: f })}
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold capitalize transition
                      ${cat.frequency === f
                        ? 'bg-teal-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}
                    `}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </EmailPreferenceCategory>
          );
        })}

        {/* Weekly digest (simple toggle) */}
        <EmailPreferenceCategory
          icon="📊"
          title="Weekly Digest"
          description="A Monday 9AM summary: matches, events, funding, curriculum."
          enabled={!!pref.preferences?.weeklyDigest?.enabled}
          disabled={isUnsubscribed}
          onToggle={(val) => mergeCategory('weeklyDigest', { enabled: val })}
        />
      </div>

      {/* Save & reset */}
      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`
            px-6 py-3 rounded-lg font-bold text-white transition
            ${saving ? 'bg-stone-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}
          `}
        >
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="px-6 py-3 rounded-lg font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Email log */}
      <EmailLogSection />
    </div>
  );
};

export default EmailPreferencesPage;
