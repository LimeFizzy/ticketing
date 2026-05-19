import Image from 'next/image';
import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
import { cookies } from 'next/headers';
import { CalendarDays, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReviewForm } from '@/components/events/review-form';
import { CATEGORY_COLORS } from '@/lib/event-styles';
import { formatEventDateLong, formatEventTime } from '@/lib/formatters';
import { getEventById, getReviewableEvents } from '@/lib/api';

export const metadata: Metadata = { title: 'Leave a Review — TicketFlow' };

const ReviewPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) => {
  const { eventId } = await searchParams;

  if (!eventId) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4 p-6">
        <p className="text-sm text-muted-foreground">No event specified.</p>
      </div>
    );
  }

  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };

  const [{ data: event }, { data: reviewableEvents }] = await Promise.all([
    getEventById({ path: { id: eventId } }),
    getReviewableEvents({ headers }),
  ]);

  if (!event) notFound();

  const reviewableEntry = reviewableEvents?.find((r) => r.eventId === eventId);
  const existingReview = reviewableEntry?.existingReview;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {existingReview ? 'Edit your review' : 'Leave a review'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your experience with others.
        </p>
      </div>

      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="p-0">
          <div className="relative aspect-video overflow-hidden rounded-t-xl">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            <Badge
              className={`absolute left-3 top-3 border text-xs font-medium ${CATEGORY_COLORS[event.category]}`}
            >
              {event.category}
            </Badge>
          </div>
          <div className="flex flex-col gap-2 p-4">
            <p className="font-semibold text-foreground">{event.title}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5 shrink-0" />
                {formatEventDateLong(event.date)} at{' '}
                {formatEventTime(event.date)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 shrink-0" />
                {event.venue}, {event.city}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="p-6">
          <ReviewForm eventId={eventId} existingReview={existingReview} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewPage;
