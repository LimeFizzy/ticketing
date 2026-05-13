export enum Route {
  Home = '/',
  SignIn = '/sign-in',
  SignUp = '/sign-up',
  Account = '/account',
  Tickets = '/tickets',
  Dashboard = '/dashboard',
}

export const eventRoute = (id: string) => `/events/${id}` as const;

export const eventBuyRoute = (id: string) => `/events/${id}/buy` as const;

export const ticketRoute = (ticketId: string) =>
  `/tickets/${ticketId}` as const;

export const dashboardEventsNewRoute = () => '/dashboard/events/new' as const;

export const dashboardEventRoute = (id: string) =>
  `/dashboard/events/${id}` as const;

export const dashboardEventTicketsRoute = (id: string) =>
  `/dashboard/events/${id}/tickets` as const;

export const dashboardEventTicketRoute = (eventId: string, ticketId: string) =>
  `/dashboard/events/${eventId}/tickets/${ticketId}` as const;
