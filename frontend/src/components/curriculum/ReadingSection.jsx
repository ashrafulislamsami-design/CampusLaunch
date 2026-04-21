import { Download } from 'lucide-react';

const ReadingSection = ({ content, pdfUrl }) => {
  if (!content && !pdfUrl) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-400 font-bold text-sm uppercase tracking-widest">Reading material coming soon</p>
      </div>
    );
  }

  const renderMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-stone-800 mt-6 mb-2 font-serif-custom">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-black text-stone-900 mt-8 mb-3 font-serif-custom">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-stone-900">$1</strong>')
      .replace(/\n\n/g, '</p><p class="text-stone-700 leading-relaxed mb-4">')
      .replace(/^/, '<p class="text-stone-700 leading-relaxed mb-4">')
      .replace(/$/, '</p>');
  };

  return (
    <section className="max-w-none">
      {content && (
        <article
          className="prose prose-stone max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      )}

      {pdfUrl && (
        <div className="mt-8 pt-6 border-t-2 border-stone-200">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-teal-50 border-2 border-teal-300 text-teal-800 font-bold text-xs uppercase tracking-widest hover:bg-teal-100 transition-all"
            style={{ borderRadius: '8px 20px 8px 20px' }}
          >
            <Download size={16} />
            Download PDF Resource
          </a>
        </div>
      )}
    </section>
  );
};

export default ReadingSection;
