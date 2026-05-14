import { Star } from 'lucide-react';
import type { ReviewDto } from '@/lib/api/types.gen';
import { formatEventDateLong } from '@/lib/formatters';

interface ReviewItemProps {
  review: ReviewDto;
}

export const ReviewItem = ({ review }: ReviewItemProps) => (
  <div className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0">
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-medium text-foreground">
        {review.userName}
      </span>
      <span className="text-xs text-muted-foreground">
        {formatEventDateLong(review.createdAt)}
      </span>
    </div>
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`size-3.5 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
    {review.comment && (
      <p className="text-sm leading-relaxed text-foreground/80">
        {review.comment}
      </p>
    )}
  </div>
);

interface RatingDistributionBarsProps {
  distribution: Array<number>;
}

export const RatingDistributionBars = ({
  distribution,
}: RatingDistributionBarsProps) => {
  const maxCount = Math.max(...distribution, 1);
  return (
    <div className="flex flex-col gap-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star - 1] ?? 0;
        const pct = (count / maxCount) * 100;
        return (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="w-4 text-right tabular-nums text-muted-foreground">
              {star}
            </span>
            <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-right tabular-nums text-muted-foreground">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
};
