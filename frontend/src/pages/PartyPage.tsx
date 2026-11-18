import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBranch } from '@/context/BranchContext';
import { useProducts } from '@/hooks/productHooks';
import { orderService } from '@/services/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CHUL, FEAST, attachOrderDetail, isoDate, useFeastDates } from '@/site/api';
import { ErrorBar, bad, phoneOk } from '@/site/form';
import { Chapter, DietMark, SupportHint, dishMeta, fmtDate } from '@/site/ui';
import { usePageTitle } from '@/site/seo';

export default function PartyPage() {
  usePageTitle('Party orders');
  const navigate = useNavigate();
  const { selectedBranchId } = useBranch();
  const { data: products } = useProducts();
  const { data: feasts } = useFeastDates();
  const request = (products ?? []).find((p) => p.workflowCode === FEAST);
  const dishes = (products ?? []).filter((p) => p.active && (p.workflowCode ?? CHUL) === CHUL);
  const minDate = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 2); return isoDate(d); }, []);

  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('13:00');
  const [guests, setGuests] = useState(25);
  const [veg, setVeg] = useState(0);
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [venue, setVenue] = useState('');
  const [dishIds, setDishIds] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const t = <T,>(set: (v: T) => void) => (v: T) => { setTouched(true); set(v); };

  const errors: string[] = [];
  if (!eventDate || eventDate < minDate) errors.push('Pick an event date at least 2 days from today');
  if (guests < 15 || guests > 500) errors.push('Guests must be between 15 and 500');
  if (veg < 0 || veg > guests) errors.push('Veg guests cannot be more than the total');
  if (!name.trim()) errors.push('Enter your name');
  if (!phoneOk(phone)) errors.push('Enter a valid 10-digit mobile number');
  if (!request) errors.push('Party requests are not open yet');

  const submit = async () => {
    if (errors.length > 0 || !request) { setTouched(true); return; }
    setBusy(true);
    try {
      const order = await orderService.place({ items: [{ itemType: 'PRODUCT', itemId: request.id, quantity: 1 }], fulfillmentType: 'SELF_PICKUP', paymentMode: 'PAY_AT_COUNTER', branchId: selectedBranchId ?? undefined });
      await attachOrderDetail({
        orderId: order.id, contactName: name.trim(), phone, notes: notes.trim() || undefined, eventDate, eventTime: eventTime.length === 5 ? `${eventTime}:00` : eventTime,
        guestCount: guests, vegGuestCount: veg, occasion: occasion.trim() || undefined, budgetPerHead: budget ? Number(budget) : undefined,
        dishIds, deliveryAddressText: venue.trim() || undefined,
      });
      navigate(`/track/${order.id}`);
    } finally {
      setBusy(false);
    }
  };

  const upcoming = (feasts ?? []).filter((f) => f.active).slice(0, 3);

  return (
    <div className="page page--narrow space-y-6">
      <Chapter no="०३" eyebrow="Party orders" title="Feast for your people">
        Weddings, birthdays, griha pravesh, office parties. Tell us the date and headcount — the catering lead calls you with a quote. Nothing is charged to send a request.
      </Chapter>
      {upcoming.length > 0 ? <p className="text-sm">Planning around a festival? <Link to="/feast-calendar" className="underline underline-offset-4">See the feast calendar</Link> ({upcoming.map((f) => `${f.name} ${fmtDate(f.date)}`).join(' · ')}).</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor="p-date">Event date</Label><Input id="p-date" type="date" min={minDate} className={`min-h-11 ${bad(touched && (!eventDate || eventDate < minDate))}`} value={eventDate} onChange={(e) => t(setEventDate)(e.target.value)} /></div>
        <div><Label htmlFor="p-time">Meal time</Label><Input id="p-time" type="time" className="min-h-11" value={eventTime} onChange={(e) => t(setEventTime)(e.target.value)} /></div>
        <div><Label htmlFor="p-guests">Guests (15 to 500)</Label><Input id="p-guests" type="number" min={15} max={500} className={`min-h-11 ${bad(guests < 15 || guests > 500)}`} value={guests} onChange={(e) => t(setGuests)(Number(e.target.value))} /></div>
        <div><Label htmlFor="p-veg">Of them vegetarian</Label><Input id="p-veg" type="number" min={0} className={`min-h-11 ${bad(veg < 0 || veg > guests)}`} value={veg} onChange={(e) => t(setVeg)(Number(e.target.value))} /></div>
        <div><Label htmlFor="p-occ">Occasion</Label><Input id="p-occ" className="min-h-11" maxLength={60} value={occasion} onChange={(e) => setOccasion(e.target.value)} /></div>
        <div><Label htmlFor="p-budget">Budget per head, ₹ (optional)</Label><Input id="p-budget" type="number" min={0} className="min-h-11" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
      </div>
      <div><Label htmlFor="p-venue">Venue or delivery address (optional)</Label><Input id="p-venue" className="min-h-11" value={venue} onChange={(e) => setVenue(e.target.value)} /></div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Dishes you have in mind (optional)</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {dishes.map((d) => (
            <label key={d.id} className="flex min-h-11 items-center gap-2 rounded-sm border bg-card px-3">
              <input type="checkbox" className="h-5 w-5" checked={dishIds.includes(d.id)} onChange={(e) => setDishIds((cur) => (e.target.checked ? [...cur, d.id] : cur.filter((x) => x !== d.id)))} />
              <DietMark veg={dishMeta(d).veg} /> {d.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor="p-name">Your name</Label><Input id="p-name" className={`min-h-11 ${bad(touched && !name.trim())}`} maxLength={60} value={name} onChange={(e) => t(setName)(e.target.value)} autoComplete="name" /></div>
        <div><Label htmlFor="p-phone">Mobile number</Label><Input id="p-phone" className={`min-h-11 ${bad(touched && !phoneOk(phone))}`} inputMode="tel" value={phone} onChange={(e) => t(setPhone)(e.target.value)} autoComplete="tel" /></div>
      </div>
      <div><Label htmlFor="p-notes">Anything else (optional)</Label><Textarea id="p-notes" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      <ErrorBar errors={errors} show={touched} />
      <Button className="btn-ember" disabled={busy || errors.length > 0} onClick={submit} data-testid="party-submit">{busy ? 'Sending…' : 'Send my request'}</Button>
      <SupportHint what="a party request" />
    </div>
  );
}
