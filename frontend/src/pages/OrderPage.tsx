import { Link } from 'react-router-dom';
import { useCart } from '@/cart';
import { useProducts } from '@/hooks/productHooks';
import { Skeleton } from '@/components/ui/skeleton';
import { CHUL, useKitchenStatus } from '@/site/api';
import { DishCard, KitchenStatusStrip, inr } from '@/site/ui';
import { usePageTitle } from '@/site/seo';

export default function OrderPage() {
  usePageTitle('Order for pickup');
  const { data: products, isLoading } = useProducts();
  const { data: kitchen } = useKitchenStatus();
  const { cartCount, totals } = useCart();
  const dishes = (products ?? []).filter((p) => p.active && (p.workflowCode ?? CHUL) === CHUL);
  const closed = kitchen ? !kitchen.orderingEnabled : false;
  return (
    <>
      <KitchenStatusStrip />
      <div className="page space-y-6">
        <header className="max-w-3xl">
          <p className="chapter-no">Order</p>
          <h1 className="font-display h-chapter mt-1">Pick, choose a time, pay</h1>
          <span className="brush-rule mt-3" aria-hidden="true" />
          <p className="mt-3 text-muted-foreground">Pickup at the Baner hotel, or delivery. Choose your time at checkout — each slot has a limit so the chul is never rushed. Ordering for the office? See <Link to="/office-lunch" className="underline underline-offset-4">team lunch</Link>.</p>
        </header>
        {closed ? <p role="status" className="rounded-sm border border-destructive p-3 text-sm">Online ordering is paused right now. {kitchen?.message ?? 'Please check back soon.'}</p> : null}
        {isLoading ? <Skeleton className="h-64 w-full" /> : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {dishes.map((p) => <li key={p.id}><DishCard p={p} order /></li>)}
          </ul>
        )}
        {!isLoading && dishes.length === 0 ? <p className="text-muted-foreground">The menu is being set up — please check back shortly.</p> : null}
      </div>
      {cartCount > 0 ? (
        <div className="band-soot sticky bottom-0 z-20 border-t border-border">
          <div className="site-container flex flex-wrap items-center justify-between gap-3 py-3">
            <span><strong>{cartCount}</strong> {cartCount === 1 ? 'dish' : 'dishes'} · {inr(totals.total)}</span>
            <span className="flex gap-3"><Link to="/cart" className="btn-ghost-line text-sm">View cart</Link><Link to="/checkout" className="btn-ember" data-testid="order-checkout">Choose time &amp; pay</Link></span>
          </div>
        </div>
      ) : null}
    </>
  );
}
