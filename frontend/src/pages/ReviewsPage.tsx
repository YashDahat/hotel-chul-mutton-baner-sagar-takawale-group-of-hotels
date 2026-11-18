import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/productHooks';
import { contact } from '@/config/siteConfig';
import { CHUL, useEarnRules } from '@/site/api';
import { Chapter, DietMark, RatingHanko, dishMeta } from '@/site/ui';
import { usePageTitle } from '@/site/seo';

export default function ReviewsPage() {
  usePageTitle('Reviews');
  const { data: products } = useProducts();
  const { data: rules } = useEarnRules();
  const coins = rules?.find((r) => r.eventType === 'REVIEW')?.points;
  const dishes = (products ?? []).filter((p) => p.active && (p.workflowCode ?? CHUL) === CHUL);
  return (
    <div className="page page--narrow space-y-8">
      <Chapter no="०७" eyebrow="Reviews" title="What people say, dish by dish">
        Reviews live on each dish so the next person knows what to order.{coins ? ` Writing one earns ${coins} coins — whatever you think of it.` : ''}
      </Chapter>
      <div className="flex flex-wrap items-center gap-6">
        <RatingHanko />
        <p className="max-w-xl text-muted-foreground">The 4.6 rating comes from Google reviews. <a className="underline underline-offset-4" href={contact.mapsUrl} target="_blank" rel="noopener noreferrer">Read them on Google Maps</a>.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {dishes.map((p) => (
          <li key={p.id}><Link to={`/products/${p.slug}`} className="flex min-h-11 items-center gap-2 rounded-sm border bg-card px-4 py-3 hover:border-primary"><DietMark veg={dishMeta(p).veg} />{p.name}<span className="ml-auto text-sm underline">Read or write</span></Link></li>
        ))}
      </ul>
    </div>
  );
}
