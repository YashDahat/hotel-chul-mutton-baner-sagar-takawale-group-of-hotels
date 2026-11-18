import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCart } from '@/cart';
import { useCancelOrder, useOrder } from '@/hooks/orderHooks';
import { useProducts } from '@/hooks/productHooks';
import FeedbackForm from '@/components/FeedbackForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { contact } from '@/config/siteConfig';
import { CHUL, FEAST, TABLE, useEarnRules, useOrderDetail, useStageEvents, useWorkflowView } from '@/site/api';
import OrderProgress from '@/site/OrderProgress';
import { SupportHint, WhatsAppShare, fmtDate, fmtTime, inr } from '@/site/ui';
import { usePageTitle } from '@/site/seo';

function icsFor(date: string, time: string, party: number, number: string): string {
  const d = date.replace(/-/g, '');
  const t = time.slice(0, 5).replace(':', '');
  const endH = String((Number(time.slice(0, 2)) + 1) % 24).padStart(2, '0');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Chul Mutton//EN', 'BEGIN:VEVENT', `UID:${number}@chulmutton`, `DTSTART:${d}T${t}00`, `DTEND:${d}T${endH}${time.slice(3, 5)}00`,
    `SUMMARY:Table for ${party} at Hotel Chul Mutton`, `LOCATION:${contact.address.replace(/,/g, '\\,')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

export default function TrackPage() {
  usePageTitle('Your order');
  const { id } = useParams();
  const orderId = id ? Number(id) : null;
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(orderId);
  const { data: wf } = useWorkflowView(order?.workflowCode);
  const stage = wf?.stages.find((s) => s.code === order?.currentStageCode);
  const done = !!stage?.terminal;
  const { data: events } = useStageEvents(orderId, !done);
  const { data: detail } = useOrderDetail(orderId);
  const { data: products } = useProducts();
  const { data: rules } = useEarnRules();
  const { addItem, cartItems } = useCart();
  const cancel = useCancelOrder();
  const [confirm, setConfirm] = useState(false);
  const fbCoins = rules?.find((r) => r.eventType === 'FEEDBACK')?.points;

  const reorder = useMemo(() => {
    if (!order || order.workflowCode !== CHUL || !products) return [];
    return order.items.filter((i) => i.itemType === 'PRODUCT').map((i) => ({ item: i, p: products.find((p) => p.id === i.itemId) })).filter((x) => x.p);
  }, [order, products]);

  if (isLoading || !order) {
    return <div className="page page--narrow"><Skeleton className="h-64 w-full" /></div>;
  }
  const isCancelled = order.currentStageCode === 'CANCELLED';
  const needsFeedback = done && !isCancelled && !order.feedbackSubmitted && order.workflowCode !== TABLE;
  const title = order.workflowCode === TABLE ? 'Your table' : order.workflowCode === FEAST ? 'Your party order request' : 'Your order';

  const downloadIcs = () => {
    if (!detail?.slotDate || !detail.slotTime) return;
    const blob = new Blob([icsFor(detail.slotDate, detail.slotTime, detail.partySize ?? 1, order.orderNumber)], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `chul-mutton-${order.orderNumber}.ics`; a.click(); URL.revokeObjectURL(url);
  };

  const reorderNow = () => {
    if (cartItems.length > 0) return;
    reorder.forEach(({ item, p }) => {
      if (!p) return;
      addItem({ id: `PRODUCT:${p.id}`, name: p.name, unitPrice: p.price, imageUrl: p.imageUrl, metadata: { itemType: 'PRODUCT', itemId: p.id, workflowCode: p.workflowCode ?? CHUL } }, item.quantity);
    });
    navigate('/cart');
  };

  const shareText = detail?.slotDate
    ? `Table for ${detail.partySize} at Hotel Chul Mutton, Baner on ${fmtDate(detail.slotDate)} at ${fmtTime(detail.slotTime)}. ${contact.mapsUrl}`
    : `Hotel Chul Mutton, Baner — ${contact.mapsUrl}`;

  return (
    <div className="page page--narrow space-y-8">
      {needsFeedback ? <FeedbackForm orderId={order.id} /> : null}
      <header>
        <p className="chapter-no">{order.orderNumber}</p>
        <h1 className="font-display h-chapter mt-1">{title}</h1>
        <span className="brush-rule mt-3" aria-hidden="true" />
        <p className="mt-3 text-muted-foreground">{isCancelled ? 'This order was cancelled.' : done ? 'All done. Thank you for eating with us.' : 'This page updates by itself — keep it open or come back anytime.'}</p>
      </header>

      {wf ? <OrderProgress stages={wf.stages} events={events ?? []} currentCode={order.currentStageCode} /> : <Skeleton className="h-40 w-full" />}

      {detail ? (
        <section className="space-y-1 rounded-sm border bg-card p-4 text-sm" aria-label="Details">
          {detail.slotDate ? <p><strong>{order.workflowCode === TABLE ? 'Table' : 'Ready'}:</strong> {fmtDate(detail.slotDate)}, {fmtTime(detail.slotTime)}</p> : null}
          {detail.partySize ? <p><strong>Party size:</strong> {detail.partySize}</p> : null}
          {detail.eventDate ? <p><strong>Event:</strong> {fmtDate(detail.eventDate)} {fmtTime(detail.eventTime)} · {detail.guestCount} guests ({detail.vegGuestCount ?? 0} veg)</p> : null}
          {detail.teamLunch ? <p><strong>Team lunch:</strong> {detail.boxCount} boxes{detail.boxLabels && detail.boxLabels.length ? ` — ${detail.boxLabels.join(', ')}` : ''}</p> : null}
          {detail.notes ? <p><strong>Your note:</strong> {detail.notes}</p> : null}
          {order.workflowCode === FEAST ? <p className="text-muted-foreground">We will call you on {detail.phone} with a quote. You pay nothing now.</p> : null}
        </section>
      ) : null}

      {order.items.length > 0 && order.workflowCode === CHUL ? (
        <section className="space-y-1 text-sm" aria-label="Items">
          {order.items.map((i) => <div key={`${i.itemType}:${i.itemId}`} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span>{inr(i.unitPrice * i.quantity)}</span></div>)}
          {order.adjustments.map((a) => <div key={a.code} className="flex justify-between text-muted-foreground"><span>{a.label}</span><span>{a.amount < 0 ? '−' : ''}{inr(Math.abs(a.amount))}</span></div>)}
          <div className="flex justify-between border-t pt-2 font-semibold"><span>Total</span><span>{inr(order.total)}</span></div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {order.workflowCode === TABLE && detail?.slotDate ? <Button type="button" variant="outline" className="min-h-11" onClick={downloadIcs}>Add to calendar</Button> : null}
        <a className="btn-ghost-line text-sm" href={contact.directionsUrl} target="_blank" rel="noopener noreferrer">Get directions</a>
        {order.workflowCode !== CHUL ? <WhatsAppShare text={shareText} label="Share with your group" /> : null}
        {reorder.length > 0 && done && !isCancelled ? <Button type="button" className="btn-ember" onClick={reorderNow} disabled={cartItems.length > 0}>Order the same again</Button> : null}
        {order.cancellable && !isCancelled ? <Button type="button" variant="outline" className="min-h-11" onClick={() => setConfirm(true)}>Cancel</Button> : null}
      </div>
      {reorder.length > 0 && cartItems.length > 0 && done ? <p className="text-sm text-muted-foreground">Your cart already has items — <Link className="underline" to="/cart">check it</Link> first to reorder.</p> : null}

      {done && !isCancelled && order.workflowCode !== TABLE ? (
        <p className="text-sm">Liked it? <Link to="/reviews" className="underline underline-offset-4">Tell others what you ate</Link>.{fbCoins ? ` Sharing feedback earns ${fbCoins} coins, whatever the rating.` : ''}</p>
      ) : null}

      <SupportHint />
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Cancel this order?"
        description={order.refundPreview != null ? `You will get ${inr(order.refundPreview)} back.` : 'This cannot be undone.'}
        confirmLabel="Yes, cancel"
        pending={cancel.isPending}
        destructive
        onConfirm={() => cancel.mutate({ id: order.id, reason: 'Cancelled by customer' }, { onSuccess: () => setConfirm(false) })}
      />
    </div>
  );
}
