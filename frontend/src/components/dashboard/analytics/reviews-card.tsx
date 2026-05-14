import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { EventReviewsSummaryDto } from '@/lib/api/types.gen';
import {
  ReviewItem,
  RatingDistributionBars,
} from '@/components/events/reviews-display';

interface Props {
  reviews: EventReviewsSummaryDto;
}

export const ReviewsCard = ({ reviews }: Props) => (
  <Card className="glass border-white/40 shadow-sm">
    <CardContent className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-foreground">Reviews</h2>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">
            {reviews.averageRating.toFixed(1)}
          </span>
          <span>({reviews.totalReviews})</span>
        </div>
      </div>

      <RatingDistributionBars distribution={reviews.ratingDistribution} />

      {reviews.reviews.length > 0 && (
        <div className="flex flex-col divide-y divide-border">
          {reviews.reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
