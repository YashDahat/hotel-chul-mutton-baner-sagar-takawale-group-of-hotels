import { Link } from 'react-router-dom';
import { contact } from '@/config/siteConfig';
import { JsonLd, restaurantLd, usePageTitle } from '@/site/seo';
import { Chapter, RatingHanko } from '@/site/ui';

const AREAS = {
  baner: { title: 'Mutton thali in Baner', h: 'Mutton thali, right here in Baner', from: 'Baner', body: 'Hotel Chul Mutton is on Balewadi High Street in Baner. Come for the handi mutton, sukka and jowar bhakri, or order for pickup and walk in when it is ready.' },
  balewadi: { title: 'Mutton thali in Balewadi', h: 'A Balewadi lunch cooked on a wood fire', from: 'Balewadi', body: 'Working or living around Balewadi? We are on Balewadi High Street, near My World Society. Book a table, or send a team-lunch order to your office.' },
  aundh: { title: 'Non-veg restaurant near Aundh', h: 'Non-veg Maharashtrian food, a short drive from Aundh', from: 'Aundh', body: 'From Aundh, Hotel Chul Mutton in Baner is the place for chul-cooked mutton and chicken thalis. Order for pickup on your way, or reserve a table.' },
  pashan: { title: 'Maharashtrian thali, Pashan Sus Road side', h: 'Maharashtrian thali for the Pashan and Sus Road crowd', from: 'Pashan and Sus Road', body: 'Coming from Pashan or Sus Road? Hotel Chul Mutton, Baner serves a full Maharashtrian thali with mutton, chicken and vegetarian choices. Book ahead for groups.' },
} as const;

export default function AreaPage({ area }: { area: keyof typeof AREAS }) {
  const a = AREAS[area];
  usePageTitle(a.title);
  return (
    <div className="page page--text space-y-8">
      <JsonLd data={{ ...restaurantLd, areaServed: a.from, description: a.body }} />
      <Chapter no="०३" eyebrow={a.from} title={a.h}>{a.body}</Chapter>
      <RatingHanko />
      <p className="flex flex-wrap gap-3"><Link to="/order" className="btn-ember">Order for pickup</Link><Link to="/book" className="btn-ghost-line">Book a table</Link><Link to="/menu" className="btn-ghost-line">See the menu</Link></p>
      <p className="text-sm text-muted-foreground">{contact.address} · <a className="underline" href={contact.directionsUrl} target="_blank" rel="noopener noreferrer">Directions</a></p>
    </div>
  );
}
