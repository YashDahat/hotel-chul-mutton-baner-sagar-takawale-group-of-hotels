import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AdminDataGrid } from '@/components/admin/AdminDataGrid';
import { BulkUploadDialog } from '@/components/admin/BulkUploadDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Blackout, KitchenStatus, adminApi, useAdminList, useAdminMutation } from '@/site/api';
import { AdminHead } from '@/site/adminKit';
import { ErrorBar, bad, selectCls } from '@/site/form';

const t5 = (v?: string | null) => (v ? v.slice(0, 5) : '');

export default function AdminKitchenPage() {
  const { data: k } = useAdminList('kitchen', adminApi.kitchen);
  const { data: blackouts } = useAdminList('blackouts', adminApi.blackouts);
  const save = useAdminMutation('kitchen', adminApi.saveKitchen, 'Kitchen board saved');
  const addB = useAdminMutation('blackouts', adminApi.addBlackout, 'Closed date added');
  const delB = useAdminMutation('blackouts', adminApi.deleteBlackout, 'Closed date removed');

  const [mode, setMode] = useState<KitchenStatus['mode']>('OPEN');
  const [reopens, setReopens] = useState('');
  const [message, setMessage] = useState('');
  const [lo, setLo] = useState(''); const [lc, setLc] = useState(''); const [dO, setDo] = useState(''); const [dc, setDc] = useState('');
  const [ordering, setOrdering] = useState(true);
  const [cap, setCap] = useState(6);
  const [lead, setLead] = useState(30);
  const [touched, setTouched] = useState(false);
  const [bDate, setBDate] = useState(''); const [bReason, setBReason] = useState(''); const [bApplies, setBApplies] = useState('BOTH');

  useEffect(() => {
    if (!k) return;
    setMode(k.mode); setReopens(k.reopensOn ?? ''); setMessage(k.message ?? '');
    setLo(t5(k.lunchOpen)); setLc(t5(k.lunchClose)); setDo(t5(k.dinnerOpen)); setDc(t5(k.dinnerClose));
    setOrdering(k.orderingEnabled); setCap(k.slotCapacity); setLead(k.leadMinutes);
  }, [k]);

  const errors: string[] = [];
  if (mode === 'CLOSED_UNTIL' && !reopens) errors.push('Pick the reopening date');
  if (cap < 1 || cap > 50) errors.push('Orders per 15-minute slot must be 1 to 50');
  if (lead < 0 || lead > 240) errors.push('Preparation time must be 0 to 240 minutes');
  if (lo && lc && lo >= lc) errors.push('Lunch closing time must be after opening');
  if (dO && dc && dO >= dc) errors.push('Dinner closing time must be after opening');
  if (message.length > 200) errors.push('Message can be up to 200 characters');

  const cols = useMemo<ColDef<Blackout>[]>(() => [
    { field: 'date', headerName: 'Date' }, { field: 'reason', headerName: 'Reason' }, { field: 'appliesTo', headerName: 'Applies to' },
  ], []);
  const field = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => { setTouched(true); set(e.target.value); };

  return (
    <div className="space-y-8">
      <section>
        <AdminHead title="Kitchen board" hint="What customers see at the top of the site: open, closed today, or reopening on a date." />
        <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
          <div><Label htmlFor="k-mode">Status</Label><select id="k-mode" className={selectCls} value={mode} onChange={(e) => { setTouched(true); setMode(e.target.value as KitchenStatus['mode']); }}><option value="OPEN">Open (follow hours)</option><option value="CLOSED_TODAY">Closed today</option><option value="CLOSED_UNTIL">Closed until a date</option></select></div>
          <div><Label htmlFor="k-re">Reopens on</Label><Input id="k-re" type="date" className={`min-h-11 ${bad(mode === 'CLOSED_UNTIL' && !reopens)}`} value={reopens} onChange={field(setReopens)} /></div>
          <div className="sm:col-span-2"><Label htmlFor="k-msg">Message to customers (optional)</Label><Input id="k-msg" className="min-h-11" maxLength={200} value={message} onChange={field(setMessage)} /></div>
          <div><Label htmlFor="k-lo">Lunch opens</Label><Input id="k-lo" type="time" className="min-h-11" value={lo} onChange={field(setLo)} /></div>
          <div><Label htmlFor="k-lc">Lunch closes</Label><Input id="k-lc" type="time" className="min-h-11" value={lc} onChange={field(setLc)} /></div>
          <div><Label htmlFor="k-do">Dinner opens</Label><Input id="k-do" type="time" className="min-h-11" value={dO} onChange={field(setDo)} /></div>
          <div><Label htmlFor="k-dc">Dinner closes</Label><Input id="k-dc" type="time" className="min-h-11" value={dc} onChange={field(setDc)} /></div>
          <div><Label htmlFor="k-cap">Orders per 15-minute slot</Label><Input id="k-cap" type="number" className={`min-h-11 ${bad(cap < 1 || cap > 50)}`} value={cap} onChange={(e) => { setTouched(true); setCap(Number(e.target.value)); }} /></div>
          <div><Label htmlFor="k-lead">Preparation time (minutes)</Label><Input id="k-lead" type="number" className={`min-h-11 ${bad(lead < 0 || lead > 240)}`} value={lead} onChange={(e) => { setTouched(true); setLead(Number(e.target.value)); }} /></div>
          <label className="flex min-h-11 items-center gap-2 sm:col-span-2"><input type="checkbox" className="h-5 w-5" checked={ordering} onChange={(e) => { setTouched(true); setOrdering(e.target.checked); }} />Online ordering is switched on</label>
          <div className="sm:col-span-2"><ErrorBar errors={errors} show={touched} /></div>
          <div><Button disabled={errors.length > 0 || save.isPending} onClick={() => save.mutate({ mode, reopensOn: reopens || null, message: message || null, lunchOpen: lo || null, lunchClose: lc || null, dinnerOpen: dO || null, dinnerClose: dc || null, orderingEnabled: ordering, slotCapacity: cap, leadMinutes: lead })}>{save.isPending ? 'Saving…' : 'Save board'}</Button></div>
        </div>
      </section>
      <section>
        <AdminHead title="Closed dates" hint="Holidays and private events. Ordering or tables are blocked on these days.">
          <BulkUploadDialog title="Bulk upload closed dates" columns={['date', 'reason', 'appliesTo']} sampleRow={['2026-12-25', 'Staff holiday', 'BOTH']} templateName="closed-dates-template.csv" onUpload={adminApi.bulkBlackouts} />
        </AdminHead>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div><Label htmlFor="b-d">Date</Label><Input id="b-d" type="date" className="min-h-11" value={bDate} onChange={(e) => setBDate(e.target.value)} /></div>
          <div><Label htmlFor="b-r">Reason</Label><Input id="b-r" className="min-h-11" maxLength={100} value={bReason} onChange={(e) => setBReason(e.target.value)} /></div>
          <div><Label htmlFor="b-a">Applies to</Label><select id="b-a" className={selectCls} value={bApplies} onChange={(e) => setBApplies(e.target.value)}><option value="BOTH">Orders and tables</option><option value="ORDERS">Orders only</option><option value="TABLES">Tables only</option></select></div>
          <Button disabled={!bDate || addB.isPending} onClick={() => addB.mutate({ date: bDate, reason: bReason || undefined, appliesTo: bApplies }, { onSuccess: () => { setBDate(''); setBReason(''); } })}>Add closed date</Button>
        </div>
        <AdminDataGrid<Blackout> rowData={blackouts ?? []} columnDefs={cols} height="420px" actions={[{ label: 'Remove', danger: true, onClick: (b) => delB.mutate(b.id) }]} emptyMessage="No closed dates." />
      </section>
    </div>
  );
}
