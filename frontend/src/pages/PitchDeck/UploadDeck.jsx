import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL as API } from '../../config';
import { Upload, FileText, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadDeck() {
  const { id } = useParams();           // if present → new version upload
  const isNewVersion = !!id;
  const { token } = useContext(AuthContext);
  const navigate  = useNavigate();

  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!file) { toast.error('Please select a PDF file'); return; }
    if (!isNewVersion && !title) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      if (!isNewVersion) { fd.append('title', title); fd.append('description', description); }

      const url    = isNewVersion ? `${API}/decks/${id}/version` : `${API}/decks`;
      const res    = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data   = await res.json();
      if (res.ok) {
        toast.success(isNewVersion ? 'New version uploaded!' : 'Deck uploaded!');
        navigate(`/decks/${data._id}/report`);
      } else toast.error(data.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="jewel-teal p-10 mb-8 relative overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.05] bg-black pointer-events-none" />
        <div className="relative z-10 flex items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-teal-50 font-serif-custom mb-2">
              {isNewVersion ? 'Upload New Version' : 'Upload Pitch Deck'}
            </h1>
            <p className="text-teal-200 text-sm">Share your PDF deck to get structured feedback from mentors and peers.</p>
          </div>
          <FileText size={64} className="text-teal-200 opacity-40 flex-shrink-0" />
        </div>
      </div>

      <div className="space-y-5">
        <div className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
             style={{ borderRadius: '12px 32px 12px 32px' }}>
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
          <div className="space-y-4 relative z-10">
            {!isNewVersion && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Deck Title *</label>
                  <input className="w-full border-2 border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium focus:border-amber-400 focus:outline-none transition"
                    style={{ borderRadius: '8px 20px 8px 20px' }}
                    placeholder="e.g. AgriTech Solution Deck v1"
                    value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Description (optional)</label>
                  <textarea className="w-full border-2 border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium focus:border-amber-400 focus:outline-none transition resize-none min-h-[80px]"
                    style={{ borderRadius: '8px 20px 8px 20px' }}
                    placeholder="What stage is your startup? What feedback are you looking for?"
                    value={description} onChange={e => setDesc(e.target.value)} />
                </div>
              </>
            )}

            {/* PDF Drop Zone */}
            <div>
              <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">PDF File *</label>
              <label className="block cursor-pointer border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 transition p-8 text-center"
                     style={{ borderRadius: '8px 24px 8px 24px' }}>
                <Upload size={32} className="mx-auto text-amber-400 mb-3" />
                <p className="text-sm font-black text-amber-900">
                  {file ? file.name : 'Click to select PDF'}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">Max 20MB · PDF only</p>
                <input type="file" accept=".pdf" className="hidden"
                  onChange={e => setFile(e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-amber-900 text-amber-50 font-black py-4 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition shadow-[4px_6px_0px_#78350f] disabled:opacity-50"
          style={{ borderRadius: '8px 32px 8px 32px' }}>
          <Upload size={16} />
          {loading ? 'Uploading…' : isNewVersion ? 'Upload New Version' : 'Submit Deck'}
        </button>
      </div>
    </div>
  );
}