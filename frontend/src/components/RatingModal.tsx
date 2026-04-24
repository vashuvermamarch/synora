import React, { useState } from 'react';
import { Star, X, Check } from 'lucide-react';
import api from '../api/client';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  partnerName: string;
  onSuccess: () => void;
}

export default function RatingModal({ isOpen, onClose, sessionId, partnerName, onSuccess }: RatingModalProps) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredScore, setHoveredScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === 0) {
      setError('PLEASE SELECT A RATING');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/sessions/rating/', {
        session_id: sessionId,
        score,
        comment
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'FAILED TO SUBMIT RATING');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-[6px] border-secondary p-8 max-w-lg w-full shadow-[16px_16px_0px_0px_#000] relative">

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary border-[4px] border-secondary flex items-center justify-center mx-auto mb-6">
            <Star size={40} fill="currentColor" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">RATE_YOUR_PARTNER</h2>
          <p className="font-mono text-xs text-muted uppercase tracking-widest mt-2">
            HOW WAS YOUR SESSION WITH <span className="text-secondary font-bold">{partnerName}</span>?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Star Selection */}
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHoveredScore(s)}
                onMouseLeave={() => setHoveredScore(0)}
                onClick={() => setScore(s)}
                className="transition-transform active:scale-90"
              >
                <Star
                  size={48}
                  strokeWidth={3}
                  className={`transition-colors ${
                    (hoveredScore || score) >= s ? 'text-primary fill-primary' : 'text-secondary'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Comment Field */}
          <div>
            <label className="block font-black uppercase tracking-widest text-xs mb-2">ADDITIONAL_FEEDBACK (OPTIONAL)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="YOUR_THOUGHTS..."
              className="w-full border-[4px] border-secondary p-4 font-bold text-sm h-32 outline-none focus:bg-primary/5 transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-500 text-white border-[3px] border-secondary p-3 font-mono text-[10px] uppercase font-black tracking-widest text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary border-[4px] border-secondary py-4 font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? 'SUBMITTING...' : (
                <>
                  <Check size={20} strokeWidth={3} />
                  SUBMIT_RATING
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
