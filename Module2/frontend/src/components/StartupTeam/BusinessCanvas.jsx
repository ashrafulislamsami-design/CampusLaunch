import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Save } from 'lucide-react';

const Block = ({ title, name, rowSpan, colSpan, extraClasses = '', value, onChange, onBlur }) => (
  <div className={`flex flex-col bg-[#ebe9e4] border-2 border-stone-200 p-5 ${rowSpan} ${colSpan} ${extraClasses}`}>
    <h3 className="font-black text-amber-900 border-b-2 border-amber-300 pb-3 mb-3 text-sm uppercase tracking-widest font-serif-custom">{title}</h3>
    <textarea
      name={name}
      value={value || ''}
      onChange={onChange}
      onBlur={onBlur}
      className="w-full h-full flex-grow resize-none border-none focus:ring-0 text-sm p-0 text-stone-700 font-medium leading-relaxed bg-transparent"
      placeholder={`Blueprint ${title.toLowerCase()}...`}
    />
  </div>
);

const BusinessCanvas = ({ teamId }) => {
  const { token } = useContext(AuthContext);
  const [canvas, setCanvas] = useState({
    keyPartners: '',
    keyActivities: '',
    keyResources: '',
    valuePropositions: '',
    customerRelationships: '',
    channels: '',
    customerSegments: '',
    costStructure: '',
    revenueStreams: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/teams/${teamId}/canvas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setCanvas(data);
        }
      })
      .catch(err => console.error(err));
  }, [teamId, token]);

  const handleChange = (e) => setCanvas({ ...canvas, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/canvas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(canvas)
      });
      if (!res.ok) throw new Error('Failed to save canvas');
      setMessage('Canvas updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="placard p-8 bg-[#ebe9e4] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] mix-blend-overlay pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-8 relative z-10 border-b-2 border-amber-300 pb-4">
        <h2 className="text-3xl font-black text-amber-900 font-serif-custom">Business Model Canvas</h2>
        <div className="flex items-center gap-4">
          {message && <span className="text-[10px] text-teal-800 bg-teal-100/80 px-3 py-1.5 uppercase tracking-widest font-black border border-teal-200 shadow-sm" style={{borderRadius: '4px 8px 4px 8px'}}>{message}</span>}
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="gilded-btn px-6 py-2 text-xs"
          >
            <Save size={18} className="icon-tactile" /> {saving ? 'Compiling...' : 'Commit Canvas'}
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-5 md:grid-rows-[minmax(180px,auto)_minmax(180px,auto)_minmax(180px,auto)] gap-0 overflow-hidden border-[3px] border-amber-300 relative z-10 shadow-[4px_6px_0px_#d97706]" style={{borderRadius: '12px 32px 12px 32px'}}>
        
        {/* Top Row - 5 blocks width */}
        <Block title="Key Partners" name="keyPartners" value={canvas.keyPartners} onChange={handleChange} onBlur={handleSave} rowSpan="md:row-span-2" colSpan="md:col-span-1" extraClasses="border-r border-b" />
        
        {/* Activities and Resources split Middle Left */}
        <div className="md:row-span-2 md:col-span-1 flex flex-col">
          <Block title="Key Activities" name="keyActivities" value={canvas.keyActivities} onChange={handleChange} onBlur={handleSave} rowSpan="flex-1" colSpan="" extraClasses="border-b" />
          <Block title="Key Resources" name="keyResources" value={canvas.keyResources} onChange={handleChange} onBlur={handleSave} rowSpan="flex-1" colSpan="" extraClasses="border-b" />
        </div>

        <Block title="Value Propositions" name="valuePropositions" value={canvas.valuePropositions} onChange={handleChange} onBlur={handleSave} rowSpan="md:row-span-2" colSpan="md:col-span-1" extraClasses="border-l border-r border-b" />
        
        {/* Relationships and Channels split Middle Right */}
        <div className="md:row-span-2 md:col-span-1 flex flex-col">
          <Block title="Customer Relationships" name="customerRelationships" value={canvas.customerRelationships} onChange={handleChange} onBlur={handleSave} rowSpan="flex-1" colSpan="" extraClasses="border-b" />
          <Block title="Channels" name="channels" value={canvas.channels} onChange={handleChange} onBlur={handleSave} rowSpan="flex-1" colSpan="" extraClasses="border-b" />
        </div>

        <Block title="Customer Segments" name="customerSegments" value={canvas.customerSegments} onChange={handleChange} onBlur={handleSave} rowSpan="md:row-span-2" colSpan="md:col-span-1" extraClasses="border-l border-b" />

        {/* Bottom Row - Cost Structure & Revenue Streams */}
        <Block title="Cost Structure" name="costStructure" value={canvas.costStructure} onChange={handleChange} onBlur={handleSave} rowSpan="md:row-span-1" colSpan="md:col-span-2" extraClasses="border-r" />
        <Block title="Revenue Streams" name="revenueStreams" value={canvas.revenueStreams} onChange={handleChange} onBlur={handleSave} rowSpan="md:row-span-1" colSpan="md:col-span-3" extraClasses="" />

      </div>
    </div>
  );
};

export default BusinessCanvas;
