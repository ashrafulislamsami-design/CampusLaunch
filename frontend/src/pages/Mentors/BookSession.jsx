import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Users, CalendarDays, Clock, FileText, ArrowLeft, Briefcase, Zap } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function generateSlots() {
  const slots = [];
  for (let h = 8; h < 18; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

export default function BookSession() {
  const { mentorId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [duration, setDuration] = useState(30);
  const [agenda, setAgenda] = useState('');
  const [loading, setLoading] = useState(false);

  const allSlots = generateSlots();

  useEffect(() => {
    fetch(`${API}/api/mentors/${mentorId}`)
      .then(r => r.json())
      .then(setMentor);
  }, [mentorId]);

  useEffect(() => {
    if (!selectedDate) return;
    fetch(`${API}/api/bookings/availability/${mentorId}?date=${selectedDate}`)
      .then(r => r.json())
      .then(data => setBookedSlots((data.bookedSlots || []).map(s => s.startTime)));
  }, [selectedDate, mentorId]);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mentorId, sessionDate: selectedDate, startTime: selectedSlot, durationMinutes: duration, agenda })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Session booked!');
        navigate('/bookings/my');
      } else {
        toast.error(data.message || 'Booking failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mentor) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-pulse text-stone-400 font-black uppercase tracking-widest text-xs">Loading mentor...</div>
    </div>
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

      {/* Back link */}
      <Link to="/mentors" className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-900 font-bold uppercase tracking-widest text-[10px] mb-8 transition">
        <ArrowLeft size={14} /> Back to Mentors
      </Link>

      {/* Mentor Profile Card */}
      <div
        className="placard p-8 mb-8 bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706] relative overflow-hidden"
        style={{ borderRadius: '12px 32px 12px 32px' }}
      >
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-sky-200 border-2 border-sky-300 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <Users size={30} className="icon-tactile text-sky-900" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-amber-900 font-serif-custom">{mentor.name}</h2>
            <p className="text-stone-500 text-sm font-sans-custom font-medium flex items-center gap-1 mt-1">
              <Briefcase size={12} /> {mentor.jobDetails}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {mentor.expertise.map(e => (
                <span key={e} className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-black px-2.5 py-1 capitalize uppercase tracking-widest" style={{ borderRadius: '4px 8px 4px 8px' }}>
                  {e}
                </span>
              ))}
            </div>
            {mentor.bio && <p className="text-stone-600 text-sm font-sans-custom leading-relaxed mt-3">{mentor.bio}</p>}
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="placard p-8 border-t-4 border-amber-400 bg-stone-50/50 space-y-8 shadow-xl" style={{ borderRadius: '12px 32px 12px 32px' }}>
        <h1 className="text-2xl font-black text-amber-900 font-serif-custom flex items-center gap-3">
          <Zap size={22} className="text-teal-700" /> Book a Session
        </h1>

        {/* Date Picker */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3">
            <CalendarDays size={13} className="text-teal-700" /> Select Date
          </label>
          <input
            type="date"
            min={minDate}
            value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
            className="border-2 border-stone-200 focus:border-amber-400 focus:ring-0 rounded-xl px-4 py-3 text-sm font-bold text-stone-800 bg-white transition-all"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3">
            <Clock size={13} className="text-teal-700" /> Session Duration
          </label>
          <div className="flex gap-3">
            {[30, 60].map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${duration === d ? 'bg-teal-800 border-teal-800 text-teal-50 shadow-md -translate-y-0.5' : 'bg-white border-stone-200 text-stone-500 hover:border-teal-400 hover:text-teal-900'}`}
                style={{ borderRadius: '8px 20px 8px 20px' }}
              >
                {d} Min
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3">
              <Clock size={13} className="text-teal-700" /> Available Slots — {selectedDate}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {allSlots.map(slot => {
                const isBooked = bookedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 text-[10px] font-black uppercase tracking-widest border-2 transition-all
                      ${isBooked
                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed border-stone-100 line-through'
                        : selectedSlot === slot
                          ? 'bg-teal-800 text-teal-50 border-teal-800 shadow-md -translate-y-0.5'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-teal-400 hover:text-teal-900'
                      }`}
                    style={{ borderRadius: '6px 14px 6px 14px' }}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            {bookedSlots.length > 0 && (
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-3">Strikethrough slots are already booked</p>
            )}
          </div>
        )}

        {/* Agenda */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3">
            <FileText size={13} className="text-teal-700" /> Session Agenda (optional)
          </label>
          <textarea
            className="w-full border-2 border-stone-200 focus:border-amber-400 focus:ring-0 rounded-xl px-4 py-3 text-sm font-sans-custom text-stone-800 bg-white transition-all min-h-[100px] resize-none"
            placeholder="What would you like to discuss? e.g. Product-market fit, fundraising strategy..."
            value={agenda}
            onChange={e => setAgenda(e.target.value)}
          />
        </div>

        {/* Paid notice */}
        {mentor.sessionType === 'paid' && (
          <div className="bg-amber-50 border-2 border-amber-200 p-4" style={{ borderRadius: '8px 20px 8px 20px' }}>
            <p className="text-amber-900 text-xs font-bold font-sans-custom">
              <strong>Paid Session:</strong> ${mentor.sessionPriceUSD} USD — payment to be arranged directly with the mentor after booking.
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleBook}
          disabled={loading || !selectedDate || !selectedSlot}
          className="w-full bg-amber-900 text-amber-50 font-black py-4 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ borderRadius: '8px 24px 8px 24px' }}
        >
          <Zap size={14} />
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}