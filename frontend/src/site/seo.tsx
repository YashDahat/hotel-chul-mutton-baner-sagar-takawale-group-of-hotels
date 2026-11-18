import { useEffect } from 'react';
import { contact } from '@/config/siteConfig';

/** Sets the document title for a page. */
export function usePageTitle(title: string) {
  useEffect(() => { document.title = `${title} | Hotel Chul Mutton, Baner`; }, [title]);
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export const restaurantLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Hotel Chul Mutton, Baner',
  servesCuisine: ['Maharashtrian', 'Mutton', 'Non-vegetarian'],
  telephone: contact.phoneTel,
  address: { '@type': 'PostalAddress', streetAddress: 'Balewadi High Street, near My World Society, Baner', addressLocality: 'Pune', addressRegion: 'Maharashtra', postalCode: '411045', addressCountry: 'IN' },
  geo: { '@type': 'GeoCoordinates', latitude: 18.5670566, longitude: 73.7763673 },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: contact.rating, reviewCount: contact.reviewCount },
  hasMap: contact.mapsUrl,
};

export function RestaurantJsonLd() {
  return <JsonLd data={restaurantLd} />;
}
