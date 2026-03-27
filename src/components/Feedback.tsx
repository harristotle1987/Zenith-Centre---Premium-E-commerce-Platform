import React, { useState, useEffect } from 'react';
import { Star, Send, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getApiUrl } from '../utils/api';

interface FeedbackItem {
  id: number;
  product_id: string;
  user_id: number | null;
  user_name: string | null;
  guest_name: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

interface FeedbackProps {
  productId: string;
  user: any;
}

export function Feedback({ productId, user }: FeedbackProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [productId]);

  const fetchFeedback = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/feedback/${productId}`));
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !guestName) {
      alert('Please provide your name to submit feedback.');
      return;
    }
    if (!comment) {
      alert('Please provide a comment.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting feedback...');
    try {
      const res = await fetch(getApiUrl('/api/feedback'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_id: user?.id,
          guest_name: user ? null : guestName,
          rating,
          comment
        })
      });

      if (res.ok) {
        setComment('');
        setGuestName('');
        setRating(5);
        toast.success('Feedback submitted successfully!');
        fetchFeedback();
      } else {
        toast.error('Failed to submit feedback.');
      }
    } catch (err) {
      toast.error('Connection error while submitting feedback.');
    } finally {
      setIsSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
        <h3 className="text-xl font-serif font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
          <MessageSquare className="text-[#d35400]" size={20} />
          Customer Feedback
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Your Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d35400] transition-all"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-all ${rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200 hover:text-yellow-200'}`}
                >
                  <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Your Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d35400] transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1a1a1a] text-white py-4 rounded-xl font-bold hover:bg-[#d35400] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Feedback</>}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Reviews</h4>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#d35400] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No feedback yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {feedbacks.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-xl border border-black/5 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1a1a1a]">{item.user_name || item.guest_name || 'Anonymous'}</p>
                        <p className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < item.rating ? 'text-yellow-400' : 'text-gray-200'}
                          fill={i < item.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.comment}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
