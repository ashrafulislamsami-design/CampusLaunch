import { Calendar, Gem, Heart, ExternalLink, UserCheck, Award } from 'lucide-react';

const FundingCard = ({ item, isSaved, onToggleSave }) => {
  return (
    <div className="placard p-8 group flex flex-col justify-between bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706] hover:-translate-y-1 hover:shadow-[6px_8px_0px_#d97706] transition-all relative overflow-hidden" style={{ borderRadius: '12px 32px 12px 32px' }}>
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none"></div>
      
      <div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 text-amber-700 rounded-xl flex items-center justify-center shadow-sm transform -rotate-3 group-hover:rotate-0 transition">
            <Gem size={28} className="icon-tactile text-amber-900" />
          </div>
          <button 
            onClick={() => onToggleSave(item._id)}
            className={`p-2 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-stone-300 hover:text-red-400'}`}
          >
            <Heart size={24} strokeWidth={isSaved ? 0 : 2} />
          </button>
        </div>

        <h3 className="text-2xl font-black text-amber-900 mb-2 font-serif-custom leading-tight">{item.title}</h3>
        <p className="text-stone-500 text-xs font-black uppercase tracking-widest mb-4">{item.provider}</p>
        
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-stone-700 font-sans-custom font-medium">
            <div className="p-1.5 bg-stone-100 rounded-lg text-amber-700">
              <Gem size={16} />
            </div>
            <span className="text-sm">Value: <span className="font-bold text-amber-900">{item.amount}</span></span>
          </div>
          <div className="flex items-center gap-3 text-stone-700 font-sans-custom font-medium">
            <div className="p-1.5 bg-stone-100 rounded-lg text-teal-700">
              <Calendar size={16} />
            </div>
            <span className="text-sm">Deadline: <span className="font-bold text-teal-900">{new Date(item.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <span className="inline-block px-3 py-1 bg-teal-50 text-teal-900 border border-teal-200 text-[10px] font-black tracking-widest uppercase mb-2" style={{ borderRadius: '4px 8px 4px 8px' }}>
            {item.category}
          </span>
          
          {/* Who Can Apply */}
          <div className="bg-stone-50/50 p-4 border border-stone-200" style={{ borderRadius: '8px 16px 8px 16px' }}>
            <h4 className="text-[10px] font-black text-amber-900 font-serif-custom uppercase tracking-widest mb-2 flex items-center gap-2">
              <UserCheck size={12} className="text-teal-700" /> Who Can Apply
            </h4>
            <p className="text-stone-600 text-[11px] font-medium leading-relaxed italic">{item.eligibility}</p>
          </div>

          {/* Previous Success - Conditional */}
          {item.pastWinners && (
            <div className="bg-stone-50/50 p-4 border border-stone-200" style={{ borderRadius: '8px 16px 8px 16px' }}>
              <h4 className="text-[10px] font-black text-amber-900 font-serif-custom uppercase tracking-widest mb-2 flex items-center gap-2">
                <Award size={12} className="text-amber-600" /> Previous Success
              </h4>
              <p className="text-stone-600 text-[11px] font-medium leading-relaxed">{item.pastWinners}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 relative z-10">
        <a 
          href={item.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-amber-900 text-amber-50 font-black py-3 uppercase tracking-widest text-[10px] border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition flex items-center justify-center gap-2"
          style={{ borderRadius: '8px 24px 8px 24px' }}
        >
          Visit Portal <ExternalLink size={12} />
        </a>
        <button 
          onClick={() => {
            const expiry = new Date(item.deadline);
            const dateStr = expiry.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, 8);
            const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`DEADLINE: ${item.title}`)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent(`Provider: ${item.provider}\nApply here: ${item.applyLink}\nEligibility: ${item.eligibility}`)}`;
            window.open(calendarUrl, '_blank');
          }}
          className="flex-1 text-center bg-amber-100 text-amber-900 font-black py-3 uppercase tracking-widest text-[10px] border-2 border-amber-300 hover:bg-amber-200 transition"
          style={{ borderRadius: '24px 8px 24px 8px' }}
        >
          Set Reminder
        </button>
      </div>
    </div>
  );
};

export default FundingCard;
