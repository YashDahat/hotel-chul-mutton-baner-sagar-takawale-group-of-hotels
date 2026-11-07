// GENERATED from the architecture plan — do not edit by hand.
// Business shell configuration (brand, nav, contact) — DERIVED from the plan + brief.
// Header nav mirrors the public route table; never hand-edit. Design tokens are
// omitted on purpose — the fenced shell supplies its own theme defaults.
import type { SiteConfig } from '@/shell';

export const siteConfig: SiteConfig = {
  header: {
    brandName: "Hotel Chul Mutton Baner - Sagar Takawale Group of Hotels",
    navLinks: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Catering", href: "/catering" },
      { label: "Gallery", href: "/gallery" },
      { label: "Menu", href: "/menu" },
      { label: "Order Confirmation", href: "/order-confirmation" },
      { label: "Order History", href: "/order-history" },
      { label: "Reservation", href: "/reservation" },
      { label: "Contact", href: "/contact" },
    ],
    showAuth: false,
    showCart: false,
  },
  footer: {
    brandName: "Hotel Chul Mutton Baner - Sagar Takawale Group of Hotels",
    address: "1, Hotel Chul Mutton Baner - Sagar Takawale Group of Hotels, Hotel Chul Mutton Survey no 119/5/11 and 120, 6, Balewadi High St, near My World Society, Baner, Pune, Maharashtra 411045",
    phone: "072728 15555",
  },
};
