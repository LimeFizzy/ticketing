import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  getEventAnalytics,
  getEventById,
  getEventReviews,
  getPromoCodes,
} from '@/lib/api';
import { EventAnalyticsDashboard } from '@/components/dashboard/analytics/event-analytics-dashboard';

const EventAnalyticsPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) => {
  const { eventId } = await params;
  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };

  const [
    { data: analytics, error: analyticsError },
    { data: event, error: eventError },
    { data: reviews },
    { data: promoCodes },
  ] = await Promise.all([
    getEventAnalytics({ path: { eventId }, headers }),
    getEventById({ path: { id: eventId }, headers }),
    getEventReviews({ path: { id: eventId }, headers }),
    getPromoCodes({ path: { eventId }, headers }),
  ]);

  if (eventError?.status === 404 || analyticsError?.status === 404) notFound();
  if (!analytics || !event) notFound();

  return (
    <EventAnalyticsDashboard
      analytics={analytics}
      event={event}
      reviews={reviews ?? null}
      promoCodes={promoCodes ?? []}
    />
  );
};

export default EventAnalyticsPage;
