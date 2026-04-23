import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CalendarDays, Clock, FileText, Star, Video, BookOpen } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STATUS_STYLES = {
  pending:   'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-stone-100 text-stone-600 border-stone-200'
};

export default function MyBookings() {
  const { token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetch(`${API}/api/bookings/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return;
    const res = await fetch(`${API}/api/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast.success('Booking cancelled');
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
    }
  };

  const handleRate = async () => {
    const res = await fetch(`${API}/api/bookings/${ratingModal}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rating, feedback })
    });
    if (res.ok) {
      toast.success('Rating submitted!');
      setRatingModal(null);
      setFeedback('');
      setRating(5);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-pulse text-stone-400 font-black uppercase tracking-widest text-xs">Loading bookings...</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

      {/* Hero Banner */}
      <div className="mb-12 jewel-teal p-10 shadow-xl relative overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.04] bg-black"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-5xl font-black mb-3 font-serif-custom text-teal-50 drop-shadow-md tracking-tight">My Bookings</h1>
            <p className="text-teal-100 text-lg font-sans-custom font-medium leading-relaxed">
              Track your mentorship sessions, join calls, and rate completed sessions.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/10 p-6 backdrop-blur-md border border-white/20 rounded-3xl">
            <BookOpen size={70} className="text-teal-100 opacity-60" />
          </div>
        </div>
      </div>

      {/* Live count */}
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
        <span className="tracking-widest text-[10px] uppercase font-bold text-amber-900/40">
          {bookings.length} Session{bookings.length !== 1 ? 's' : ''} Total
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="placard p-16 text-center border-dashed border-2 border-stone-200" style={{ borderRadius: '16px 48px 16px 48px' }}>
          <p className="text-stone-400 font-black uppercase tracking-widest text-sm mb-4">No bookings yet.</p>
          <Link
            to="/mentors"
            className="inline-block bg-amber-900 text-amber-50 font-black px-8 py-3 uppercase tracking-widest text-xs border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition"
            style={{ borderRadius: '8px 24px 8px 24px' }}
          >
            Browse Mentors
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(b => (
            <div
              key={b._id}
              className="placard p-8 bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706] hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_#d97706] transition-all relative overflow-hidden"
              style={{ borderRadius: '12px 32px 12px 32px' }}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

                {/* Left Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-black text-amber-900 font-serif-custom mb-2">{b.mentorName}</h3>

                  <div className="flex flex-wrap gap-4 text-stone-600 text-xs font-sans-custom font-medium">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={12} className="text-teal-700" />
                      {new Date(b.sessionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-amber-700" />
                      {b.startTime} – {b.endTime} ({b.durationMinutes} min)
                    </span>
                  </div>

                  {b.agenda && (
                    <div className="mt-4 bg-stone-50 border border-stone-200 p-3" style={{ borderRadius: '6px 14px 6px 14px' }}>
                      <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <FileText size={10} /> Agenda
                      </p>
                      <p className="text-stone-600 text-xs font-sans-custom italic">{b.agenda}</p>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <span className={`text-[10px] font-black px-3 py-1.5 border-2 uppercase tracking-widest capitalize self-start ${STATUS_STYLES[b.status]}`} style={{ borderRadius: '4px 12px 4px 12px' }}>
                  {b.status}
                </span>
              </div>

              {/* Action Row */}
              <div className="flex flex-wrap gap-3 mt-6">
                {b.meetingLink && b.status === 'confirmed' && (
                  <a
                    href={b.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-teal-800 text-teal-50 font-black px-5 py-2.5 uppercase tracking-widest text-[10px] border-2 border-transparent hover:bg-teal-100 hover:text-teal-900 hover:border-teal-400 transition"
                    style={{ borderRadius: '8px 20px 8px 20px' }}
                  >
                    <Video size={12} /> Join Google Meet
                  </a>
                )}
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    className="inline-flex items-center gap-2 bg-red-50 text-red-700 font-black px-5 py-2.5 uppercase tracking-widest text-[10px] border-2 border-red-200 hover:bg-red-100 transition"
                    style={{ borderRadius: '8px 20px 8px 20px' }}
                  >
                    Cancel
                  </button>
                )}
                {b.status === 'completed' && !b.studentRating && (
                  <button
                    onClick={() => setRatingModal(b._id)}
                    className="inline-flex items-center gap-2 bg-amber-900 text-amber-50 font-black px-5 py-2.5 uppercase tracking-widest text-[10px] border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition"
                    style={{ borderRadius: '8px 20px 8px 20px' }}
                  >
                    <Star size={12} /> Rate Session
                  </button>
                )}
                {b.status === 'completed' && b.studentRating && (
                  <span className="text-amber-400 text-sm tracking-tight self-center">
                    {'★'.repeat(b.studentRating)}
                    <span className="text-stone-200">{'★'.repeat(5 - b.studentRating)}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div
            className="bg-white p-8 w-full max-w-sm shadow-[6px_8px_0px_#d97706] border-2 border-amber-200 space-y-6"
            style={{ borderRadius: '12px 32px 12px 32px' }}
          >
            <h3 className="text-xl font-black text-amber-900 font-serif-custom">Rate Your Session</h3>

            {/* Stars */}
            <div className="flex gap-2 justify-center text-3xl">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`transition-transform hover:scale-110 ${n <= rating ? 'text-amber-400' : 'text-stone-200'}`}
                >★</button>
              ))}
            </div>

            <textarea
              className="w-full border-2 border-stone-200 focus:border-amber-400 focus:ring-0 rounded-xl px-4 py-3 text-sm font-sans-custom text-stone-800 resize-none min-h-[80px]"
              placeholder="Optional feedback..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={handleRate}
                className="flex-1 bg-amber-900 text-amber-50 font-black py-3 uppercase tracking-widest text-xs border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition"
                style={{ borderRadius: '8px 20px 8px 20px' }}
              >
                Submit
              </button>
              <button
                onClick={() => setRatingModal(null)}
                className="flex-1 bg-stone-100 text-stone-600 font-black py-3 uppercase tracking-widest text-xs border-2 border-stone-200 hover:bg-stone-200 transition"
                style={{ borderRadius: '20px 8px 20px 8px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}