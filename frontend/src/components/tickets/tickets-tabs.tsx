'use client';

import { useState } from 'react';
import { type Tab, type UserTicket } from '@/types/tickets';
import { TicketCard } from '@/components/tickets/ticket-card';
import { cn } from '@/lib/utils';

interface TicketsTabsProps {
  upcoming: UserTicket[];
  past: UserTicket[];
}

export const TicketsTabs = ({ upcoming, past }: TicketsTabsProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  const tickets = activeTab === 'upcoming' ? upcoming : past;

  return (
    <>
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
                ? `Upcoming (${upcoming.length})`
                : `Past (${past.length})`}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

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
    </>
  );
};
