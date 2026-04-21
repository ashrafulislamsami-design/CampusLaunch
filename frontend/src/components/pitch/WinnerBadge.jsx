const WinnerBadge = ({ title, size = 'md' }) => {
  const sizeClass = size === 'lg' ? 'px-5 py-2.5 text-sm' : 'px-3 py-1.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClass} bg-gradient-to-r from-amber-100 to-amber-200 border-2 border-amber-400 text-amber-900 font-bold tracking-wide shadow-sm`}
      style={{ borderRadius: '6px 16px 6px 16px' }}
    >
      {title}
    </span>
  );
};

export default WinnerBadge;
