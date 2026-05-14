'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createReview, updateReview, deleteReview } from '@/lib/api';
import type { ProblemDetails, ReviewDto } from '@/lib/api/types.gen';
import { Route } from '@/lib/routes';

interface Props {
  eventId: string;
  existingReview?: ReviewDto;
}

export const ReviewForm = ({ eventId, existingReview }: Props) => {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = { rating, comment: comment.trim() || undefined };
      if (existingReview) {
        const { error: err } = await updateReview({
          path: { reviewId: existingReview.id },
          body,
        });
        if (err) throw err;
      } else {
        const { error: err } = await createReview({
          body: { eventId, ...body },
        });
        if (err) {
          if ((err as ProblemDetails).status === 403) {
            setError("You can only review events you've attended.");
            return;
          }
          throw err;
        }
      }
      setDone(true);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    setDeleting(true);
    try {
      await deleteReview({ path: { reviewId: existingReview.id } });
      router.push(Route.Home);
    } catch {
      setError('Could not delete review. Please try again.');
      setDeleting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`size-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
            />
          ))}
        </div>
        <p className="text-lg font-semibold text-foreground">
          Thank you for your review!
        </p>
        <p className="text-sm text-muted-foreground">
          Your feedback helps others discover great events.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
            >
              <Star
                className={`size-8 transition-colors ${
                  n <= (hovered || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          Comment{' '}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience…"
          rows={4}
          className="resize-none"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={rating === 0 || submitting}>
          {submitting
            ? 'Saving…'
            : existingReview
              ? 'Update review'
              : 'Submit review'}
        </Button>
        {existingReview && (
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? 'Deleting…' : 'Delete review'}
          </Button>
        )}
      </div>
    </form>
  );
};
