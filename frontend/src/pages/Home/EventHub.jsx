import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CalendarDays, MapPin, Link as LinkIcon, Users, CheckCircle } from 'lucide-react';

const EventHub = () => {
  const { token, userTeamId } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
      } else {
        throw new Error(data.message || 'Failed to load events');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [token]);

  const handleRegister = async (eventId) => {
    if (!userTeamId) {
      alert("You must create or join a Startup Team first before registering for events!");
      return;
    }

    setRegistering(eventId);
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ teamId: userTeamId })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Refresh events to show registered status
      fetchEvents();
    } catch (err) {
      alert(err.message);
    } finally {
      setRegistering(null);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500 font-bold">Loading Events...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-bold">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="bg-orange-600 rounded-3xl p-10 shadow-md text-white mb-10 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white text-orange-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <CalendarDays size={32} />
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Event Discovery Hub</h1>
          <p className="text-orange-100 text-lg max-w-2xl">
            Discover upcoming hackathons, pitch competitions, and startup accelerators. Register your team to secure your spot and start building!
          </p>
        </div>
      </div>

      {/* Event List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {events.map((evt) => {
          const eventDate = new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
          const isRegistered = userTeamId && evt.attendees.includes(userTeamId);

          return (
            <div key={evt._id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{evt.title}</h2>
                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {eventDate}
                </span>
              </div>
              
              <p className="text-gray-600 mb-6 flex-grow">{evt.description}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin size={16} className="mr-2 text-gray-400" /> {evt.location}
                </div>
                <div className="flex items-center text-sm text-indigo-600 hover:underline">
                  <LinkIcon size={16} className="mr-2 text-indigo-400" /> 
                  <a href={evt.link} target="_blank" rel="noopener noreferrer">Official Event Page</a>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Users size={16} className="mr-2 text-gray-400" /> {evt.attendees.length} Team(s) Registered
                </div>
              </div>

              {/* Action Button */}
              {isRegistered ? (
                <button disabled className="w-full bg-green-50 text-green-700 font-bold py-3 rounded-xl flex justify-center items-center gap-2 cursor-not-allowed">
                  <CheckCircle size={20} /> Team Registered
                </button>
              ) : (
                <button 
                  onClick={() => handleRegister(evt._id)}
                  disabled={registering === evt._id}
                  className="w-full bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                >
                  {registering === evt._id ? 'Registering...' : 'Register Team'}
                </button>
              )}
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="col-span-1 lg:col-span-2 text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">No upcoming events found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventHub;
