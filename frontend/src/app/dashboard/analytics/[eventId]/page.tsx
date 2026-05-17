import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getEventAnalytics, getEventById } from '@/lib/api';
import { EventAnalyticsDashboard } from '@/components/dashboard/analytics/event-analytics-dashboard';

const EventAnalyticsPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) => {
  const { eventId } = await params;
  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };

  const [{ data: analytics }, { data: event }] = await Promise.all([
    getEventAnalytics({ path: { eventId }, headers }),
    getEventById({ path: { id: eventId }, headers }),
  ]);

  if (!analytics || !event) notFound();

  return <EventAnalyticsDashboard analytics={analytics} event={event} />;
};

export default EventAnalyticsPage;
