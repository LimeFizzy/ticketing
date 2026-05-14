import { cookies } from 'next/headers';
import {
  getAllEventAnalytics,
  getAnalyticsSummary,
  getEvents,
  getMe,
} from '@/lib/api';
import { AnalyticsDashboard } from '@/components/dashboard/analytics/analytics-dashboard';

export type EventRating = { rating: number | null; reviews: number };

const AnalyticsPage = async () => {
  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };

  const [{ data: me }, { data: summary }, { data: events }] = await Promise.all(
    [
      getMe({ headers }),
      getAnalyticsSummary({ headers }),
      getAllEventAnalytics({ headers }),
    ]
  );

  // TODO: Implement Pagination
  const { data: myEvents } = me?.id
    ? await getEvents({ headers, query: { organizerId: me.id, page: 1, pageSize: 20 } })
    : { data: { items: [] } };

  const eventRatings: Record<string, EventRating> = {};
  for (const e of myEvents?.items ?? []) {
    eventRatings[e.id] = {
      rating: e.averageRating ?? null,
      reviews: e.reviewCount ?? 0,
    };
  }

  return (
    <AnalyticsDashboard
      summary={summary ?? null}
      events={events ?? []}
      eventRatings={eventRatings}
    />
  );
};

export default AnalyticsPage;
