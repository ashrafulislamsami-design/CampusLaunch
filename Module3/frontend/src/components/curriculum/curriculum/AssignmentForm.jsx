import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitAssignment } from '../../services/curriculumService';

const AssignmentForm = ({ weekNumber, assignment, progress, onSubmitted }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isSubmitted = progress?.assignmentSubmitted;

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const maxWords = assignment?.maxWords || 500;
  const overLimit = wordCount > maxWords;

  if (!assignment?.prompt) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-400 font-bold text-sm uppercase tracking-widest">Assignment coming soon</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('Please write your assignment before submitting');
      return;
    }
    if (overLimit) {
      toast.error(`Please keep your response under ${maxWords} words`);
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await submitAssignment(weekNumber, text);
      toast.success('Assignment submitted successfully!');
      if (onSubmitted) onSubmitted(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <div className="placard p-6 mb-6 bg-amber-50/50">
        <h4 className="text-sm font-bold uppercase tracking-widest text-amber-800 mb-2">Assignment Prompt</h4>
        <p className="text-stone-700 leading-relaxed">{assignment.prompt}</p>
      </div>

      {isSubmitted ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-4 py-3 bg-teal-50 border-2 border-teal-200 rounded-lg">
            <CheckCircle size={20} className="text-teal-600" />
            <span className="font-bold text-teal-800 text-sm uppercase tracking-widest">Submitted</span>
          </div>
          <div className="bg-white border-2 border-stone-200 rounded-lg p-6">
            <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{progress.assignmentText}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your assignment response here..."
              rows={10}
              className="w-full p-4 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0 text-stone-800 resize-y transition-colors"
              aria-label="Assignment response"
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-2 px-1">
              <span className={`text-xs font-bold ${overLimit ? 'text-red-500' : 'text-stone-400'}`}>
                {wordCount} / {maxWords} words
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim() || overLimit}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-900 text-amber-50 font-bold text-xs uppercase tracking-widest hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ borderRadius: '8px 20px 8px 20px' }}
          >
            <Send size={16} />
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </div>
      )}
    </section>
  );
};

export default AssignmentForm;
