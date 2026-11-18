import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '@/cart';
import type { CartItem } from '@/cart';
import { useBranch } from '@/context/BranchContext';
import { useAddresses } from '@/hooks/addressHooks';
import { orderService } from '@/services/orderService';
import { verifyPayment } from '@/services/paymentService';
import { loyaltyService } from '@/services/loyaltyService';
import { loadRazorpay, openRazorpay } from '@/lib/razorpay';
import type { CartLineInput, FulfillmentType, PlaceOrderRequest, QuoteResponse } from '@/types/order';
import type { OfferValidationResult } from '@/types/loyalty';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { attachOrderDetail, isoDate, usePickupSlots } from '@/site/api';
import { ErrorBar, bad, phoneOk, selectCls } from '@/site/form';
import { fmtDate, fmtTime, inr } from '@/site/ui';
import { usePageTitle } from '@/site/seo';

function toLine(item: CartItem): CartLineInput {
  const md = (item.metadata ?? {}) as { itemType?: string; itemId?: number };
  let itemType = md.itemType;
  let itemId = md.itemId;
  if (!itemType || itemId == null) {
    const parts = String(item.id).split(':');
    if (parts.length === 2) {
      itemType = itemType ?? parts[0];
      itemId = itemId ?? Number(parts[1]);
    } else {
      itemType = itemType ?? 'PRODUCT';
      itemId = itemId ?? Number(item.id);
    }
  }
  return { itemType: String(itemType), itemId: Number(itemId), variantKey: item.variantKey ?? null, quantity: item.quantity };
}

const COIN_CONNECTOR = 'loyalty.coins';
const DISCOUNT_CONNECTOR = 'loyalty.discount';

const nextDays = (n: number): string[] => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return isoDate(d); });

/**
 * Checkout for the chul order: when & how (pickup or delivery, time slot, optional team-lunch labels), then pay.
 * Places the order through the order spine, attaches the slot details, then lands on the live tracking page.
 */
export default function CheckoutPage() {
  usePageTitle('Checkout');
  const { cartItems, totals, clearCart } = useCart();
  const { selectedBranchId } = useBranch();
  const { data: addresses } = useAddresses();
  const navigate = useNavigate();

  const [fulfillment, setFulfillment] = useState<FulfillmentType>('SELF_PICKUP');
  const [pickupPayAtCounter, setPickupPayAtCounter] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState<string | null>(null);
  const [useCoins, setUseCoins] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeResult, setCodeResult] = useState<OfferValidationResult | null>(null);
  const [applyingCode, setApplyingCode] = useState(false);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [placing, setPlacing] = useState(false);

  const days = useMemo(() => nextDays(7), []);
  const [slotDate, setSlotDate] = useState(days[0]);
  const [slotTime, setSlotTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [team, setTeam] = useState(false);
  const [boxes, setBoxes] = useState(2);
  const [labels, setLabels] = useState('');
  const [touched, setTouched] = useState(false);
  const edit = <T,>(set: (v: T) => void) => (v: T) => { setTouched(true); set(v); };

  const { data: slots, isLoading: slotsLoading } = usePickupSlots(slotDate);
  const open = (slots ?? []).filter((s) => s.remaining > 0);

  const lines = useMemo(() => cartItems.map(toLine), [cartItems]);
  const empty = cartItems.length === 0;

  useEffect(() => {
    if (addressId == null && addresses && addresses.length > 0) {
      setAddressId((addresses.find((a) => a.isDefault) ?? addresses[0]).id);
    }
  }, [addresses, addressId]);

  useEffect(() => { setSlotTime(''); }, [slotDate]);

  const deliveryOptions = (quote?.options ?? []).filter((o) => o.connectorId !== COIN_CONNECTOR);
  const coinOption = quote?.options.find((o) => o.connectorId === COIN_CONNECTOR) ?? null;
  const selectedDelivery = deliveryOptions.find((o) => o.code === deliveryCode) ?? null;
  const deliveryFee = fulfillment === 'DELIVERY' && selectedDelivery ? selectedDelivery.amount : 0;
  const coinDiscount = useCoins && coinOption ? coinOption.amount : 0;
  const codeDiscount = codeResult?.valid ? -codeResult.amount : 0;
  const grandTotal = totals.total + deliveryFee + coinDiscount + codeDiscount;

  useEffect(() => { setCodeResult(null); }, [totals.total]);

  const applyCode = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setApplyingCode(true);
    try { setCodeResult(await loyaltyService.validateOffer(code, totals.total)); } finally { setApplyingCode(false); }
  };

  useEffect(() => {
    if (cartItems.length === 0) { setQuote(null); return; }
    let active = true;
    setQuoting(true);
    orderService.quote({ items: lines, fulfillmentType: fulfillment })
      .then((q) => {
        if (!active) return;
        setQuote(q);
        if (fulfillment === 'DELIVERY') {
          const first = q.options.find((o) => o.connectorId !== COIN_CONNECTOR);
          setDeliveryCode((prev) => prev ?? first?.code ?? null);
        }
      })
      .finally(() => { if (active) setQuoting(false); });
    return () => { active = false; };
  }, [fulfillment, cartItems.length, lines]);

  const errors: string[] = [];
  if (!name.trim()) errors.push('Enter the name for the order');
  if (!phoneOk(phone)) errors.push('Enter a valid 10-digit mobile number');
  if (!slotTime) errors.push('Choose a time');
  if (team && (boxes < 2 || boxes > 15)) errors.push('Team lunch is for 2 to 15 boxes');
  if (fulfillment === 'DELIVERY' && addressId == null) errors.push('Choose a delivery address');

  const placeOrder = async () => {
    if (errors.length > 0) { setTouched(true); return; }
    const paymentMode = fulfillment === 'SELF_PICKUP' && pickupPayAtCounter ? 'PAY_AT_COUNTER' : 'ONLINE';
    const connectorSelections: Record<string, string> = {};
    if (fulfillment === 'DELIVERY' && selectedDelivery) connectorSelections[selectedDelivery.connectorId] = selectedDelivery.code;
    if (useCoins && coinOption) connectorSelections[coinOption.connectorId] = coinOption.code;
    if (codeResult?.valid && codeResult.code) connectorSelections[DISCOUNT_CONNECTOR] = codeResult.code;
    const req: PlaceOrderRequest = {
      items: lines, fulfillmentType: fulfillment, paymentMode, connectorSelections,
      branchId: selectedBranchId ?? undefined,
      addressId: fulfillment === 'DELIVERY' ? addressId ?? undefined : undefined,
    };

    setPlacing(true);
    try {
      const order = await orderService.place(req);
      try {
        await attachOrderDetail({
          orderId: order.id, contactName: name.trim(), phone, notes: notes.trim() || undefined,
          slotDate, slotTime: slotTime.length === 5 ? `${slotTime}:00` : slotTime,
          teamLunch: team, boxCount: team ? boxes : undefined,
          boxLabels: team ? labels.split(/[\n,]/).map((l) => l.trim()).filter(Boolean) : undefined,
        });
      } catch {
        // The interceptor already told the customer why (e.g. the slot just filled); the order still exists.
      }
      const go = () => navigate(`/track/${order.id}`);
      if (order.payment) {
        if (order.payment.gatewayKeyId === 'demo_key') {
          await verifyPayment({ gatewayOrderId: order.payment.gatewayOrderId, gatewayPaymentId: `demo_pay_${order.payment.gatewayOrderId}`, signature: 'demo_signature' });
          clearCart();
          toast.success('Payment successful (demo mode)');
          go();
          return;
        }
        const ok = await loadRazorpay();
        if (!ok) { toast.error('Could not load the payment SDK'); go(); return; }
        try {
          const result = await openRazorpay({
            keyId: order.payment.gatewayKeyId, orderId: order.payment.gatewayOrderId, amount: order.payment.amount,
            currency: order.payment.currency, name: 'Hotel Chul Mutton', description: order.orderNumber,
          });
          await verifyPayment({ gatewayOrderId: result.razorpay_order_id, gatewayPaymentId: result.razorpay_payment_id, signature: result.razorpay_signature });
          clearCart();
          toast.success('Payment successful');
          go();
        } catch {
          toast.message('Payment not completed — you can pay from your order');
          clearCart();
          go();
        }
      } else {
        clearCart();
        toast.success('Order placed');
        go();
      }
    } finally {
      setPlacing(false);
    }
  };

  if (empty) {
    return (
      <div className="page page--narrow">
        <div className="rounded-sm border bg-card p-6" data-testid="checkout-empty">
          <p className="font-display text-xl">Your cart is empty.</p>
          <p className="mt-2 text-muted-foreground">Pick a dish from the menu and come back.</p>
          <Link to="/order" className="btn-ember mt-4">Choose dishes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--narrow space-y-6">
      <header>
        <p className="chapter-no">Checkout</p>
        <h1 className="font-display h-chapter mt-1">When &amp; how</h1>
        <span className="brush-rule mt-3" aria-hidden="true" />
      </header>

      <section className="space-y-4 rounded-sm border bg-card p-4" aria-label="Fulfilment">
        <RadioGroup value={fulfillment} onValueChange={(v) => { setTouched(true); setFulfillment(v as FulfillmentType); }}>
          <div className="flex items-center gap-2"><RadioGroupItem value="SELF_PICKUP" id="f-pickup" /><Label htmlFor="f-pickup">Pick up at the hotel (Baner)</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="DELIVERY" id="f-delivery" /><Label htmlFor="f-delivery">Delivery</Label></div>
        </RadioGroup>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="slot-date">Day</Label>
            <select id="slot-date" className={selectCls} value={slotDate} onChange={(e) => edit(setSlotDate)(e.target.value)}>
              {days.map((d) => <option key={d} value={d}>{fmtDate(d)}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="slot-time">{fulfillment === 'DELIVERY' ? 'Deliver by' : 'Ready at'}</Label>
            <select id="slot-time" className={`${selectCls} ${bad(touched && !slotTime)}`} value={slotTime} onChange={(e) => edit(setSlotTime)(e.target.value)} disabled={slotsLoading}>
              <option value="">{slotsLoading ? 'Loading…' : open.length === 0 ? 'No times left this day' : 'Choose a time'}</option>
              {open.map((s) => <option key={s.time} value={s.time}>{fmtTime(s.time)}</option>)}
            </select>
          </div>
        </div>

        {fulfillment === 'DELIVERY' && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Delivery address</p>
            {addresses && addresses.length > 0 ? (
              <RadioGroup value={addressId != null ? String(addressId) : ''} onValueChange={(v) => setAddressId(Number(v))}>
                {addresses.map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <RadioGroupItem value={String(a.id)} id={`addr-${a.id}`} className="mt-1" />
                    <Label htmlFor={`addr-${a.id}`} className="font-normal">
                      <span className="font-medium">{a.label ?? 'Address'}</span>
                      <span className="block text-xs text-muted-foreground">{[a.line1, a.line2, a.city, a.pincode].filter(Boolean).join(', ')}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-sm text-muted-foreground">No saved addresses. <Link to="/account" className="underline">Add one in your account</Link>.</p>
            )}
            <p className="pt-2 text-sm font-medium">Delivery option</p>
            {quoting ? <p className="text-sm text-muted-foreground">Fetching options…</p> : deliveryOptions.length > 0 ? (
              <RadioGroup value={deliveryCode ?? ''} onValueChange={setDeliveryCode}>
                {deliveryOptions.map((o) => (
                  <div key={`${o.connectorId}:${o.code}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><RadioGroupItem value={o.code} id={`d-${o.code}`} /><Label htmlFor={`d-${o.code}`}>{o.label}{o.detail ? <span className="text-muted-foreground"> · {o.detail}</span> : null}</Label></div>
                    <span className="text-sm">{inr(o.amount)}</span>
                  </div>
                ))}
              </RadioGroup>
            ) : <p className="text-sm text-muted-foreground">No delivery options available.</p>}
          </div>
        )}

        {fulfillment === 'SELF_PICKUP' && (
          <div className="flex items-center gap-2">
            <input id="pay-at-counter" type="checkbox" className="h-5 w-5" checked={pickupPayAtCounter} onChange={(e) => setPickupPayAtCounter(e.target.checked)} />
            <Label htmlFor="pay-at-counter">I will pay at the counter (otherwise pay now by UPI or card)</Label>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-sm border bg-card p-4" aria-label="Your details">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="c-name">Name for the order</Label><Input id="c-name" className={`min-h-11 ${bad(touched && !name.trim())}`} value={name} maxLength={60} onChange={(e) => edit(setName)(e.target.value)} autoComplete="name" /></div>
          <div><Label htmlFor="c-phone">Mobile number</Label><Input id="c-phone" className={`min-h-11 ${bad(touched && !phoneOk(phone))}`} value={phone} inputMode="tel" onChange={(e) => edit(setPhone)(e.target.value)} autoComplete="tel" /></div>
        </div>
        <div className="flex items-center gap-2">
          <input id="team" type="checkbox" className="h-5 w-5" checked={team} onChange={(e) => edit(setTeam)(e.target.checked)} />
          <Label htmlFor="team">This is a team lunch (separate labelled boxes)</Label>
        </div>
        {team && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="boxes">Boxes (2 to 15)</Label><Input id="boxes" type="number" min={2} max={15} className={`min-h-11 ${bad(boxes < 2 || boxes > 15)}`} value={boxes} onChange={(e) => edit(setBoxes)(Number(e.target.value))} /></div>
            <div><Label htmlFor="labels">Names on the boxes (one per line)</Label><Textarea id="labels" rows={3} value={labels} onChange={(e) => edit(setLabels)(e.target.value)} /></div>
          </div>
        )}
        <div><Label htmlFor="c-notes">Note for the kitchen (optional)</Label><Textarea id="c-notes" rows={2} maxLength={200} value={notes} onChange={(e) => edit(setNotes)(e.target.value)} /></div>
      </section>

      <section className="space-y-3 rounded-sm border bg-card p-4" aria-label="Savings">
        {coinOption && (
          <label className="flex items-center justify-between gap-3" htmlFor="use-coins">
            <span className="text-sm font-medium">{coinOption.label}{coinOption.detail ? <span className="text-muted-foreground"> · {coinOption.detail}</span> : null}</span>
            <input id="use-coins" data-testid="checkout-use-coins" type="checkbox" className="h-5 w-5" checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} />
          </label>
        )}
        <Label htmlFor="offer-code">Discount code</Label>
        <div className="flex gap-2">
          <Input id="offer-code" data-testid="checkout-code-input" className="min-h-11 uppercase" placeholder="Have a code?" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} />
          <Button type="button" variant="outline" className="min-h-11" onClick={applyCode} disabled={applyingCode || !codeInput.trim()}>{applyingCode ? '…' : 'Apply'}</Button>
        </div>
        {codeResult && <p className={`text-xs ${codeResult.valid ? 'text-green-700' : 'text-destructive'}`} data-testid="checkout-code-msg">{codeResult.message}</p>}
      </section>

      <section className="space-y-1 rounded-sm border bg-card p-4 text-sm" aria-label="Summary">
        {cartItems.map((item) => <div key={`${item.id}:${item.variantKey ?? ''}`} className="flex justify-between"><span>{item.name} × {item.quantity}</span><span>{inr(item.unitPrice * item.quantity)}</span></div>)}
        <div className="flex justify-between border-t pt-2 text-muted-foreground"><span>Subtotal</span><span>{inr(totals.total)}</span></div>
        {deliveryFee > 0 && <div className="flex justify-between text-muted-foreground"><span>{selectedDelivery?.label}</span><span>{inr(deliveryFee)}</span></div>}
        {coinDiscount < 0 && <div className="flex justify-between text-muted-foreground"><span>{coinOption?.label}</span><span>−{inr(Math.abs(coinDiscount))}</span></div>}
        {codeDiscount < 0 && <div className="flex justify-between text-muted-foreground"><span>Code {codeResult?.code}</span><span>−{inr(Math.abs(codeDiscount))}</span></div>}
        <div className="flex justify-between pt-1 text-base font-semibold"><span>Total</span><span data-testid="checkout-total">{inr(grandTotal)}</span></div>
      </section>

      <ErrorBar errors={errors} show={touched} />
      <Button className="btn-ember w-full" disabled={placing || errors.length > 0} data-testid="place-order" onClick={placeOrder}>
        {placing ? 'Placing…' : fulfillment === 'SELF_PICKUP' && pickupPayAtCounter ? 'Place order (pay at counter)' : 'Place order & pay'}
      </Button>
    </div>
  );
}
