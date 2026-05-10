export enum Route {
  Home = '/',
  SignIn = '/sign-in',
  SignUp = '/sign-up',
  Account = '/account',
  Tickets = '/tickets',
}

export const eventRoute = (id: string) => `/events/${id}` as const;

export const eventBuyRoute = (id: string) => `/events/${id}/buy` as const;

export const ticketRoute = (ticketId: string) =>
  `/tickets/${ticketId}` as const;
