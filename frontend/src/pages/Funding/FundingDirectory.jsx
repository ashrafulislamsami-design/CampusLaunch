import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import FundingCard from './FundingCard';
import { Search, Filter, Rocket } from 'lucide-react';

const FundingDirectory = () => {
  const { token, user, setUser } = useContext(AuthContext);
  const [funding, setFunding] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    fetchFunding();
    if (user && user.watchlist) {
      setWatchlist(user.watchlist);
    }
  }, [user]);

  const fetchFunding = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/funding?search=${search}&category=${category}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setFunding(data);
    } catch (err) {
      console.error('Failed to fetch funding:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (fundingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/funding/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fundingId })
      });
      const data = await res.json();
      if (res.ok) {
        setWatchlist(data);
        // Sync back to AuthContext user object if needed
        if (setUser && user) {
           setUser({ ...user, watchlist: data });
        }
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFunding();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="mb-12 relative">
        <div className="text-center md:text-left mb-10 overflow-hidden relative p-12 jewel-teal shadow-xl" style={{ borderRadius: '16px 48px 16px 48px' }}>
          <div className="absolute inset-0 opacity-[0.05] bg-black"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="md:w-2/3">
              <h1 className="text-5xl font-black mb-4 font-serif-custom text-teal-50 drop-shadow-md tracking-tight">The Funding Matrix</h1>
              <p className="text-teal-100 text-lg font-sans-custom font-medium max-w-2xl leading-relaxed">
                Connect with the leading grants, competitions, and startup accelerators across the Bangladesh ecosystem. Your seed capital starts here.
              </p>
            </div>
            <div className="flex-shrink-0 bg-white/10 p-6 backdrop-blur-md border border-white/20 rounded-3xl">
               <Rocket size={80} className="text-teal-100 opacity-60 transform rotate-12" />
            </div>
          </div>
        </div>

        {/* Stats Hub */}
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
          <span className="tracking-widest text-[10px] uppercase font-bold text-amber-900/40">
            Currently Tracking {funding.length} Active Opportunities for Bangladesh Startups
          </span>
        </div>

        {/* Filters and Search Hub */}
        <div className="placard p-8 border-t-4 border-amber-400 bg-stone-50/50 flex flex-col md:flex-row gap-6 items-center shadow-xl mb-12">
           <div className="relative flex-1 w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                <Search size={20} />
              </span>
              <input 
                type="text" 
                placeholder="Search resources by title or provider..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-stone-200 focus:border-amber-400 focus:ring-0 text-stone-800 font-bold tracking-tight rounded-2xl shadow-inner transition-all hover:border-stone-300"
              />
           </div>
           
           <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              <div className="flex items-center gap-2 mr-4 text-stone-500 font-black uppercase tracking-widest text-[10px]">
                 <Filter size={14} /> Categories:
              </div>
              {['All', 'Grant', 'Competition', 'Accelerator'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${category === cat ? 'bg-amber-900 border-amber-900 text-amber-50 shadow-md transform -translate-y-0.5' : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-900'}`}
                  style={{ borderRadius: '8px 20px 8px 20px' }}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        {/* Grid Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200"></div>
            ))}
          </div>
        ) : (
          <>
            {funding.length === 0 ? (
              <div className="text-center py-20 placard bg-stone-50 border-dashed border-2 border-stone-200" style={{ borderRadius: '16px 48px 16px 48px' }}>
                <p className="text-stone-400 font-black uppercase tracking-widest text-sm">No funding opportunities match your matrix search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {funding.map((item) => (
                  <FundingCard 
                    key={item._id} 
                    item={item} 
                    isSaved={watchlist.includes(item._id)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FundingDirectory;
