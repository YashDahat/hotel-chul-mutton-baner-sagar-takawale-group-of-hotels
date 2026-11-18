import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/productHooks';
import { Skeleton } from '@/components/ui/skeleton';
import { CHUL } from '@/site/api';
import { Chapter, DishCard, KitchenStatusStrip } from '@/site/ui';
import { usePageTitle } from '@/site/seo';

export default function MenuPage() {
  usePageTitle('Menu');
  const { data: products, isLoading } = useProducts();
  const dishes = (products ?? []).filter((p) => p.active && (p.workflowCode ?? CHUL) === CHUL);
  const groups = dishes.reduce<Record<string, typeof dishes>>((acc, p) => { const k = p.category ?? 'Menu'; (acc[k] ??= []).push(p); return acc; }, {});
  return (
    <>
      <KitchenStatusStrip />
      <div className="page space-y-10">
        <Chapter no="०१" eyebrow="Menu" title="From the chul">
          Mutton cooked slow over a wood-fired chul, with jowar bhakri, tandoor roti and a cooling solkadhi. Prices marked indicative are confirmed on the day.
        </Chapter>
        {isLoading ? <Skeleton className="h-64 w-full" /> : Object.entries(groups).map(([cat, items]) => (
          <section key={cat} aria-labelledby={`cat-${cat}`}>
            <h2 id={`cat-${cat}`} className="font-display mb-4 text-2xl">{cat}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{items.map((p) => <li key={p.id}><DishCard p={p} /></li>)}</ul>
          </section>
        ))}
        <p><Link to="/order" className="btn-ember">Order for pickup</Link></p>
      </div>
    </>
  );
}
