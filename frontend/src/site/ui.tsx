// Shared presentational pieces for the Chul Mutton site: rating hanko, kitchen board, dish cards, chapter headings.
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/cart';
import { Button } from '@/components/ui/button';
import type { ProductDto } from '@/types/product';
import { contact } from '@/config/siteConfig';
import { CHUL, useEarnRules, useKitchenStatus } from '@/site/api';
import Reveal from '@/site/Reveal';

export const inr = (n: number | null | undefined): string => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n ?? 0)}`;

export const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const fmtTime = (t: string | null | undefined): string => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

/** Diet / Marathi name / price confirmation are stored as readable feature lines on the product. */
export function dishMeta(p: ProductDto): { veg: boolean; marathi: string | null; indicative: boolean } {
  const f = p.features ?? [];
  const marathi = f.find((x) => x.startsWith('Marathi: '));
  return { veg: f.includes('Veg'), marathi: marathi ? marathi.replace('Marathi: ', '') : null, indicative: f.some((x) => x.startsWith('Indicative price')) };
}

export function DietMark({ veg }: { veg: boolean }) {
  return <span className={`diet-mark ${veg ? 'diet-veg' : 'diet-nonveg'}`} role="img" aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'} />;
}

export function RatingHanko({ small = false }: { small?: boolean }) {
  if (small) {
    return <span className="hanko hanko--sm hanko--light" aria-label={`${contact.rating} stars`}>{contact.rating}★</span>;
  }
  return (
    <span className="hanko" role="img" aria-label={`Rated ${contact.rating} out of 5 from ${contact.reviewCount} Google reviews`}>
      <span className="text-2xl font-display">{contact.rating} ★</span>
      <span className="text-xs">{new Intl.NumberFormat('en-IN').format(contact.reviewCount)}<br />Google reviews</span>
    </span>
  );
}

/** Numbered chapter heading with a brush rule that draws in. */
export function Chapter({ no, eyebrow, title, children }: { no: string; eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <Reveal className="mb-8 max-w-3xl">
      <p className="chapter-no">{no}{eyebrow ? ` · ${eyebrow}` : ''}</p>
      <h2 className="font-display h-chapter mt-2">{title}</h2>
      <span className="brush-rule mt-3" aria-hidden="true" />
      {children ? <div className="mt-4 text-muted-foreground">{children}</div> : null}
    </Reveal>
  );
}

/** Live kitchen status: open / closed today / reopening on a date. Set by admin; never guessed. */
export function KitchenStatusStrip() {
  const { data: k } = useKitchenStatus();
  if (!k) return null;
  let text: string;
  if (k.mode === 'CLOSED_UNTIL' && k.reopensOn) text = `Reopening on ${fmtDate(k.reopensOn)}`;
  else if (k.mode === 'CLOSED_TODAY') text = 'Closed today';
  else if (k.lunchOpen && k.lunchClose) text = `${k.openNow ? 'The chul is lit' : 'Kitchen hours'} — lunch ${fmtTime(k.lunchOpen)} to ${fmtTime(k.lunchClose)}`;
  else text = 'The chul is lit';
  const live = k.mode === 'OPEN' && k.openNow;
  return (
    <div className="band-soot border-b border-border" role="status">
      <div className="site-container flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm">
        <span className={`ember-dot ${live ? 'ember-dot--live' : ''}`} aria-hidden="true" />
        <strong>{text}</strong>
        {k.message ? <span className="text-muted-foreground">{k.message}</span> : null}
        {k.todaysHandi.length > 0 ? (
          <span className="text-muted-foreground">
            Today&apos;s handi: {k.todaysHandi.map((h) => (h.left > 0 ? `${h.name} (${h.left} left)` : `${h.name} — sold out today`)).join(' · ')}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** Add / adjust a dish in the foundation cart, refusing to mix workflows (the server would 409). */
export function AddControl({ p }: { p: ProductDto }) {
  const { cartItems, addItem, setItemQuantity, removeItem } = useCart();
  const id = `PRODUCT:${p.id}`;
  const line = cartItems.find((i) => String(i.id) === id);
  const foreign = cartItems.some((i) => {
    const wf = (i.metadata as { workflowCode?: string } | undefined)?.workflowCode;
    return wf != null && wf !== (p.workflowCode ?? CHUL);
  });
  const sold = p.stockTracked && (p.available ?? 0) <= 0;
  if (sold) return <span className="text-sm font-medium text-muted-foreground">Sold out today</span>;
  if (!line) {
    return (
      <Button
        type="button"
        size="sm"
        className="min-h-11"
        onClick={() => {
          if (foreign) { toast.message('Finish this order first — your cart has items from another kind of order.'); return; }
          addItem({ id, name: p.name, unitPrice: p.price, imageUrl: p.imageUrl, metadata: { itemType: 'PRODUCT', itemId: p.id, workflowCode: p.workflowCode ?? CHUL } });
        }}
      >
        <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Add
      </Button>
    );
  }
  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label={`Quantity of ${p.name}`}>
      <Button type="button" size="icon" variant="outline" className="h-11 w-11" aria-label={`Remove one ${p.name}`}
        onClick={() => (line.quantity <= 1 ? removeItem(line.id, line.variantKey) : setItemQuantity(line.id, line.quantity - 1, line.variantKey))}>
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-6 text-center font-semibold" aria-live="polite">{line.quantity}</span>
      <Button type="button" size="icon" variant="outline" className="h-11 w-11" aria-label={`Add one more ${p.name}`}
        onClick={() => setItemQuantity(line.id, line.quantity + 1, line.variantKey)}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function DishCard({ p, order = false }: { p: ProductDto; order?: boolean }) {
  const m = dishMeta(p);
  const { data: rules } = useEarnRules();
  const reviewCoins = rules?.find((r) => r.eventType === 'REVIEW')?.points;
  return (
    <article className="flex h-full flex-col rounded-sm border bg-card p-4 text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold"><DietMark veg={m.veg} />{p.name}</h3>
        <span className="whitespace-nowrap font-display text-lg">{inr(p.price)}</span>
      </div>
      {m.marathi ? <p className="text-sm text-muted-foreground" lang="mr">{m.marathi}</p> : null}
      {p.description ? <p className="mt-2 flex-1 text-sm">{p.description}</p> : <div className="flex-1" />}
      {m.indicative ? <p className="mt-2 text-xs font-medium text-muted-foreground">Indicative price — confirmed on the day</p> : null}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {order ? <AddControl p={p} /> : <Link to="/order" className="btn-ghost-line text-sm">Order this</Link>}
        <Link to={`/products/${p.slug}`} className="text-sm underline underline-offset-4">
          Rate it{reviewCoins ? ` (+${reviewCoins} coins)` : ''}
        </Link>
      </div>
    </article>
  );
}

export function WhatsAppShare({ text, label = 'Share on WhatsApp' }: { text: string; label?: string }) {
  const href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="btn-ghost-line text-sm">{label}</a>;
}

export function SupportHint({ what = 'this order' }: { what?: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      Need help with {what}? <Link to="/support" className="underline underline-offset-4">Write to Support</Link> — we reply on the case thread, usually the same day during open hours. Urgent? Call{' '}
      <a href={`tel:${contact.phoneTel}`} className="underline underline-offset-4">{contact.phoneDisplay}</a>.
    </p>
  );
}
