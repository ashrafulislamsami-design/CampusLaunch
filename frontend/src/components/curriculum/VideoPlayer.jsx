import { useState } from 'react';
import { Play } from 'lucide-react';

const VideoPlayer = ({ videoUrl, thumbnail, title }) => {
  const [showIframe, setShowIframe] = useState(false);

  const fallbackThumbnail = thumbnail || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="360" fill="%23f5f5f4"%3E%3Crect width="640" height="360"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="20" fill="%2378716c"%3EVideo Thumbnail%3C/text%3E%3C/svg%3E';

  if (!videoUrl) {
    return (
      <div className="w-full bg-stone-100 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
        <p className="text-stone-400 font-bold text-sm uppercase tracking-widest">Video coming soon</p>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
      {showIframe ? (
        <iframe
          src={`${videoUrl}?autoplay=1&rel=0`}
          title={title || 'Video Tutorial'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          onClick={() => setShowIframe(true)}
          className="absolute inset-0 w-full h-full group cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-offset-2"
          aria-label={`Play video: ${title || 'Tutorial'}`}
        >
          <img
            src={fallbackThumbnail}
            alt={`Thumbnail for ${title || 'video'}`}
            className="w-full h-full object-cover"
            width={640}
            height={360}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Play size={36} className="text-amber-900 ml-1" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
