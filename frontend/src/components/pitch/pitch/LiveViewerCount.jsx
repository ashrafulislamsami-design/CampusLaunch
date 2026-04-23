import { Eye } from 'lucide-react';

const LiveViewerCount = ({ count = 0 }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur text-white rounded-full text-xs font-bold">
    <Eye size={14} />
    <span>{count}</span>
    <span className="text-white/60">watching</span>
  </div>
);

export default LiveViewerCount;
