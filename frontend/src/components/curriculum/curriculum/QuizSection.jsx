import React, { useState } from 'react';
import { CheckCircle, XCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitQuiz } from '../../services/curriculumService';

const QuizSection = ({ weekNumber, questions, progress, onSubmitted }) => {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const isSubmitted = progress?.quizSubmitted;

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-400 font-bold text-sm uppercase tracking-widest">Quiz coming soon</p>
      </div>
    );
  }

  const handleSelect = (qIndex, optIndex) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    const orderedAnswers = questions.map((_, i) => answers[i]);

    try {
      setSubmitting(true);
      const { data } = await submitQuiz(weekNumber, orderedAnswers);
      toast.success(`Quiz submitted! Score: ${data.quizScore}%`);
      if (onSubmitted) onSubmitted(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      {isSubmitted && (
        <div className={`flex items-center gap-3 px-5 py-4 border-2 rounded-lg ${progress.quizScore >= 60 ? 'bg-teal-50 border-teal-300' : 'bg-amber-50 border-amber-300'}`}>
          <span className="text-2xl font-black">{progress.quizScore}%</span>
          <span className="font-bold text-sm uppercase tracking-widest">
            {progress.quizScore >= 80 ? 'Excellent!' : progress.quizScore >= 60 ? 'Good job!' : 'Keep learning!'}
          </span>
        </div>
      )}

      {questions.map((q, qIndex) => {
        const submitted = isSubmitted;
        const studentAnswer = submitted ? progress.quizAnswers?.[qIndex] : answers[qIndex];

        return (
          <article key={qIndex} className="placard p-5 bg-white">
            <p className="font-bold text-stone-800 mb-4">
              <span className="text-amber-700 mr-2">Q{qIndex + 1}.</span>
              {q.question}
            </p>

            <div className="space-y-2" role="radiogroup" aria-label={`Question ${qIndex + 1}`}>
              {q.options.map((opt, optIndex) => {
                const isSelected = studentAnswer === optIndex;
                const isCorrect = q.correctIndex === optIndex;
                let optStyle = 'border-stone-200 hover:border-amber-300 bg-white';

                if (submitted) {
                  if (isCorrect) optStyle = 'border-teal-400 bg-teal-50';
                  else if (isSelected && !isCorrect) optStyle = 'border-red-400 bg-red-50';
                  else optStyle = 'border-stone-200 bg-stone-50 opacity-60';
                } else if (isSelected) {
                  optStyle = 'border-amber-400 bg-amber-50';
                }

                return (
                  <button
                    key={optIndex}
                    onClick={() => handleSelect(qIndex, optIndex)}
                    disabled={submitted || submitting}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-2 rounded-lg text-left transition-all ${optStyle} disabled:cursor-not-allowed`}
                    role="radio"
                    aria-checked={isSelected}
                  >
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-stone-300'}`}>
                      {isSelected && !submitted && <span className="w-2 h-2 bg-white rounded-full" />}
                      {submitted && isCorrect && <CheckCircle size={16} className="text-teal-600" />}
                      {submitted && isSelected && !isCorrect && <XCircle size={16} className="text-red-500" />}
                    </span>
                    <span className={`text-sm ${submitted && isCorrect ? 'font-bold text-teal-800' : 'text-stone-700'}`}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </article>
        );
      })}

      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < questions.length}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-900 text-amber-50 font-bold text-xs uppercase tracking-widest hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ borderRadius: '8px 20px 8px 20px' }}
        >
          <Send size={16} />
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      )}
    </section>
  );
};

export default React.memo(QuizSection);
