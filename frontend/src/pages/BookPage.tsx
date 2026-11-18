import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranch } from '@/context/BranchContext';
import { orderService } from '@/services/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TABLE, attachOrderDetail, isoDate, useTableSlots } from '@/site/api';
import { ErrorBar, bad, phoneOk, selectCls } from '@/site/form';
import { KitchenStatusStrip, SupportHint, fmtDate, fmtTime } from '@/site/ui';
import { usePageTitle } from '@/site/seo';

export default function BookPage() {
  usePageTitle('Book a table');
  const navigate = useNavigate();
  const { selectedBranchId } = useBranch();
  const from = useMemo(() => isoDate(new Date()), []);
  const to = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 14); return isoDate(d); }, []);
  const { data: slots, isLoading } = useTableSlots(from, to);
  const free = (slots ?? []).filter((s) => s.active && s.left > 0);
  const dates = Array.from(new Set(free.map((s) => s.date))).sort();
  const [date, setDate] = useState('');
  const [slotId, setSlotId] = useState<number | null>(null);
  const [party, setParty] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [occasion, setOccasion] = useState('');
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const activeDate = date || dates[0] || '';
  const times = free.filter((s) => s.date === activeDate);

  const errors: string[] = [];
  if (slotId == null) errors.push('Choose a time');
  if (party < 1 || party > 12) errors.push('Party size must be between 1 and 12');
  if (!name.trim()) errors.push('Enter the name for the booking');
  if (!phoneOk(phone)) errors.push('Enter a valid 10-digit mobile number');

  const submit = async () => {
    if (errors.length > 0 || slotId == null) { setTouched(true); return; }
    setBusy(true);
    try {
      const order = await orderService.place({ items: [{ itemType: 'TABLE_SLOT', itemId: slotId, quantity: 1 }], fulfillmentType: 'SELF_PICKUP', paymentMode: 'PAY_AT_COUNTER', branchId: selectedBranchId ?? undefined });
      await attachOrderDetail({ orderId: order.id, contactName: name.trim(), phone, partySize: party, occasion: occasion.trim() || undefined, notes: notes.trim() || undefined });
      navigate(`/track/${order.id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <KitchenStatusStrip />
      <div className="page page--narrow space-y-6">
        <header>
          <p className="chapter-no">Book a table</p>
          <h1 className="font-display h-chapter mt-1">Keep a seat by the chul</h1>
          <span className="brush-rule mt-3" aria-hidden="true" />
          <p className="mt-3 text-muted-foreground">Free to book — you pay when you eat. Please arrive within 15 minutes of your time.</p>
        </header>
        {isLoading ? <p>Loading times…</p> : dates.length === 0 ? (
          <p className="rounded-sm border p-4" role="status">No tables are open for booking right now. Call us or <a className="underline" href="/party">send a party request</a>.</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="b-date">Day</Label><select id="b-date" className={selectCls} value={activeDate} onChange={(e) => { setDate(e.target.value); setSlotId(null); setTouched(true); }}>{dates.map((d) => <option key={d} value={d}>{fmtDate(d)}</option>)}</select></div>
              <div><Label htmlFor="b-party">Guests (1 to 12)</Label><Input id="b-party" type="number" min={1} max={12} className={`min-h-11 ${bad(party < 1 || party > 12)}`} value={party} onChange={(e) => { setParty(Number(e.target.value)); setTouched(true); }} /></div>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Time</legend>
              <div className="flex flex-wrap gap-2">
                {times.map((s) => (
                  <button key={s.id} type="button" aria-pressed={slotId === s.id} onClick={() => { setSlotId(s.id); setTouched(true); }}
                    className={`min-h-11 rounded-sm border px-4 ${slotId === s.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'}`}>
                    {fmtTime(s.time)}<span className="ml-2 text-xs opacity-80">{s.left} left</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="b-name">Name for the booking</Label><Input id="b-name" className={`min-h-11 ${bad(touched && !name.trim())}`} value={name} maxLength={60} onChange={(e) => { setName(e.target.value); setTouched(true); }} autoComplete="name" /></div>
              <div><Label htmlFor="b-phone">Mobile number</Label><Input id="b-phone" className={`min-h-11 ${bad(touched && !phoneOk(phone))}`} value={phone} inputMode="tel" onChange={(e) => { setPhone(e.target.value); setTouched(true); }} autoComplete="tel" /></div>
              <div><Label htmlFor="b-occ">Occasion (optional)</Label><Input id="b-occ" className="min-h-11" value={occasion} maxLength={60} onChange={(e) => setOccasion(e.target.value)} /></div>
            </div>
            <div><Label htmlFor="b-notes">Anything we should know (optional)</Label><Textarea id="b-notes" rows={2} maxLength={200} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <ErrorBar errors={errors} show={touched} />
            <Button className="btn-ember" disabled={busy || errors.length > 0} onClick={submit} data-testid="book-submit">{busy ? 'Booking…' : 'Book this table'}</Button>
          </>
        )}
        <SupportHint what="a booking" />
      </div>
    </>
  );
}

export { TABLE };
