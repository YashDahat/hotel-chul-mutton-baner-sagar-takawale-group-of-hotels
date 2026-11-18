// Navigation contract for Chul Mutton. Link via ROUTES.*; imports nothing by design (cycle-safe).

export const ROUTES = {
  HOME: '/',
  MENU: '/menu',
  ORDER: '/order',
  BOOK: '/book',
  PARTY: '/party',
  OFFICE_LUNCH: '/office-lunch',
  FEAST_CALENDAR: '/feast-calendar',
  TRACK: '/track/:id',
  STORY: '/story',
  REVIEWS: '/reviews',
  SUGGEST: '/suggest',
  ME: '/me',
  CHECKOUT: '/checkout',
  ACCOUNT: '/account',
  SUPPORT: '/support',
  ADMIN_MENU: '/admin/menu',
  ADMIN_KITCHEN: '/admin/kitchen',
  ADMIN_TABLES: '/admin/tables',
  ADMIN_KITCHEN_ORDERS: '/admin/kitchen-orders',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_PARTY: '/admin/party',
  ADMIN_FEAST_DATES: '/admin/feast-dates',
  ADMIN_SUGGESTIONS: '/admin/suggestions',
  NOT_FOUND: '*',
} as const;

export type RouteGate = 'public' | 'auth' | 'admin';

export interface RouteEntry {
  key: keyof typeof ROUTES;
  path: string;
  label: string;
  gate: RouteGate;
  nav: boolean;
}

export const routeTable: RouteEntry[] = [
  { key: 'HOME', path: ROUTES.HOME, label: 'Home', gate: 'public', nav: false },
  { key: 'MENU', path: ROUTES.MENU, label: 'Menu', gate: 'public', nav: true },
  { key: 'ORDER', path: ROUTES.ORDER, label: 'Order', gate: 'public', nav: true },
  { key: 'BOOK', path: ROUTES.BOOK, label: 'Book a table', gate: 'auth', nav: true },
  { key: 'PARTY', path: ROUTES.PARTY, label: 'Party orders', gate: 'auth', nav: true },
  { key: 'STORY', path: ROUTES.STORY, label: 'Our story', gate: 'public', nav: true },
];
