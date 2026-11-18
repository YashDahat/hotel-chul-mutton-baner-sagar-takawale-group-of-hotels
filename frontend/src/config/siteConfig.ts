// Hotel Chul Mutton, Baner — site configuration (header, footer, contact). Facts come from the business listing.
import type { SiteConfig } from '@/shell';

export const contact = {
  phoneDisplay: '072728 15555',
  phoneTel: '+917272815555',
  // WhatsApp is only linked once the owner confirms the number is on WhatsApp.
  whatsappEnabled: false,
  address: 'Survey no. 119/5/11 & 120, 6, Balewadi High Street, near My World Society, Baner, Pune, Maharashtra 411045',
  mapsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJHRxjCBi_wjsRpt4jbmLdoSA',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=18.5670566,73.7763673&destination_place_id=ChIJHRxjCBi_wjsRpt4jbmLdoSA',
  rating: 4.6,
  reviewCount: 10602,
  hours: 'Lunch 12:00 PM – 4:30 PM (check the kitchen board for today)',
};

export const siteConfig: SiteConfig = {
  header: {
    brandName: 'Chul Mutton',
    logoUrl: null,
    navLinks: [
      { label: 'Menu', href: '/menu' },
      { label: 'Order', href: '/order' },
      { label: 'Book a table', href: '/book' },
      { label: 'Party orders', href: '/party' },
      { label: 'Our story', href: '/story' },
      { label: 'Support', href: '/support' },
    ],
    ctaButton: { label: 'Order for pickup', href: '/order' },
    showAuth: true,
    bgClass: 'bg-[#1A1411] border-b-[#A0522D]',
    textClass: 'text-[#F3E9DC]',
    hoverClass: 'hover:text-[#D98A5B]',
    ctaClass: 'bg-[#FF4500] text-[#1A1411] hover:bg-[#FF6A33]',
  },
  footer: {
    brandName: 'Hotel Chul Mutton, Baner',
    tagline: 'Mutton, slow-cooked on the chul. A Sagar Takawale Group hotel.',
    address: contact.address,
    phone: contact.phoneDisplay,
    email: null,
    openingHours: contact.hours,
    quickLinks: [
      { label: 'Menu', href: '/menu' },
      { label: 'Order', href: '/order' },
      { label: 'Book a table', href: '/book' },
      { label: 'Party orders', href: '/party' },
      { label: 'Office lunch', href: '/office-lunch' },
      { label: 'Feast calendar', href: '/feast-calendar' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'Our story', href: '/story' },
      { label: 'My account', href: '/account' },
      { label: 'Support', href: '/support' },
      { label: 'Suggest an idea', href: '/suggest' },
      { label: 'Loyalty terms', href: '/loyalty-terms' },
    ],
    socialLinks: [],
    bgClass: 'bg-[#F1E4C8]',
    textClass: 'text-[#362419]',
  },
};

export default siteConfig;
