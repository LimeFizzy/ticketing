'use client';

import { useState } from 'react';
import { EVENTS, TODAY } from '@/lib/mock-data';
import { getUserTickets } from '@/lib/tickets';
import { type Tab } from '@/types/tickets';
import { TicketCard } from '@/components/tickets/ticket-card';
import { cn } from '@/lib/utils';

const { upcoming: upcomingTickets, past: pastTickets } = getUserTickets(
  EVENTS,
  TODAY
);

const TicketsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  const tickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Tickets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your purchased event tickets
        </p>
      </div>

      {/* Tab bar */}
      <div className="relative border-b border-border">
        <div className="flex" role="tablist">
          {(['upcoming', 'past'] as Tab[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative px-4 py-2 text-sm font-medium capitalize transition-colors outline-none cursor-pointer',
                activeTab === tab
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === 'upcoming'
                ? `Upcoming (${upcomingTickets.length})`
                : `Past (${pastTickets.length})`}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket list */}
      <div role="tabpanel" className="flex flex-col gap-3">
        {tickets.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No {activeTab} tickets.
          </p>
        ) : (
          tickets.map((t) => (
            <TicketCard
              key={t.ticketId}
              event={t.event}
              ticketId={t.ticketId}
              isPast={t.isPast}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
