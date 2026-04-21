import { useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';

const PitchDeckViewer = ({ url, filename }) => {
  const [loaded, setLoaded] = useState(false);

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-stone-400">
        <FileText size={40} className="mb-3" />
        <p className="font-bold text-sm uppercase tracking-widest">No pitch deck uploaded</p>
      </div>
    );
  }

  // Click-to-load facade pattern for performance
  if (!loaded) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-amber-400 transition"
        onClick={() => setLoaded(true)}
      >
        <FileText size={40} className="text-amber-700 mb-3" />
        <p className="font-bold text-sm text-stone-700">{filename || 'Pitch Deck'}</p>
        <p className="text-xs text-stone-500 mt-1">Click to load PDF viewer</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
          {filename || 'Pitch Deck'}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-bold"
        >
          <ExternalLink size={12} />
          Open
        </a>
      </div>
      <iframe
        src={url}
        title="Pitch Deck Viewer"
        className="w-full border-2 border-stone-200 rounded-lg"
        style={{ height: '60vh', minHeight: '400px' }}
        loading="lazy"
      />
    </div>
  );
};

export default PitchDeckViewer;
