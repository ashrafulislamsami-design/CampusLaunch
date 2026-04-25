import React, { useEffect, useState } from 'react';
import { getEmailLog } from '../../services/emailService';

const STATUS_STYLES = {
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  skipped: 'bg-stone-100 text-stone-600',
};

const TYPE_LABELS = {
  welcome: 'Welcome',
  weekly_digest: 'Weekly Digest',
  session_booking_student: 'Session Booked',
  session_booking_mentor: 'New Session (Mentor)',
  session_reminder: 'Session Reminder',
  session_feedback: 'Feedback Request',
  pitch_registration: 'Pitch Registration',
  pitch_reminder: 'Pitch Reminder',
  pitch_results: 'Pitch Results',
  funding_reminder: 'Funding Reminder',
  curriculum_certificate: 'Certificate Earned',
  week_unlocked: 'New Week Unlocked',
  connection_request: 'Connection Request',
  connection_accepted: 'Connection Accepted',
  canvas_version_saved: 'Canvas Version',
};

const EmailLogSection = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEmailLog();
        setLogs(data);
      } catch (e) {
        setErr('Failed to load email log');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-stone-900 mb-1">
        Recent Emails Sent to You
      </h2>
      <p className="text-sm text-stone-500 mb-4">
        The last 20 emails our system delivered to your inbox.
      </p>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        {loading && (
          <div className="p-8 text-center text-stone-400 text-sm">Loading…</div>
        )}
        {err && (
          <div className="p-8 text-center text-red-600 text-sm">{err}</div>
        )}
        {!loading && !err && logs.length === 0 && (
          <div className="p-8 text-center text-stone-400 text-sm">
            No emails yet. Your email history will appear here.
          </div>
        )}
        {!loading && !err && logs.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Subject</th>
                <th className="text-left px-4 py-3">Sent</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-t border-stone-100">
                  <td className="px-4 py-3 font-medium text-stone-800">
                    {TYPE_LABELS[log.emailType] || log.emailType}
                  </td>
                  <td className="px-4 py-3 text-stone-600 max-w-xs truncate">
                    {log.subject}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {new Date(log.sentAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`
                        inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                        ${STATUS_STYLES[log.status] || 'bg-stone-100 text-stone-600'}
                      `}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmailLogSection;
