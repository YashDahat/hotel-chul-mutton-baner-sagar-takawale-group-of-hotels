import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AdminDataGrid } from '@/components/admin/AdminDataGrid';
import { BulkUploadDialog } from '@/components/admin/BulkUploadDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FEAST, FeastDate, adminApi, useAdminList, useAdminMutation } from '@/site/api';
import { AdminHead } from '@/site/adminKit';
import { ErrorBar, bad } from '@/site/form';

function FeastForm({ initial, pending, onSave, onClose }: { initial: FeastDate | null; pending: boolean; onSave: (b: Partial<FeastDate>) => void; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [mr, setMr] = useState(initial?.marathiName ?? '');
  const [date, setDate] = useState(initial?.date ?? '');
  const [opens, setOpens] = useState(initial?.preorderOpensOn ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [active, setActive] = useState(initial?.active ?? true);
  const [touched, setTouched] = useState(false);
  const errors: string[] = [];
  if (!name.trim()) errors.push('Name is required');
  if (!date) errors.push('Date is required');
  if (opens && date && opens > date) errors.push('Pre-orders must open on or before the feast date');
  const w = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setTouched(true); set(e.target.value); };
  return (
    <Dialog open onOpenChange={(o) => { if (!o && !pending) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? 'Edit feast date' : 'Add feast date'}</DialogTitle><DialogDescription className="sr-only">Feast calendar entry</DialogDescription></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="f-n">Name</Label><Input id="f-n" className={bad(touched && !name.trim())} value={name} onChange={w(setName)} /></div>
          <div><Label htmlFor="f-m">Marathi name</Label><Input id="f-m" lang="mr" value={mr} onChange={w(setMr)} /></div>
          <div><Label htmlFor="f-d">Date</Label><Input id="f-d" type="date" className={bad(touched && !date)} value={date} onChange={w(setDate)} /></div>
          <div><Label htmlFor="f-o">Pre-orders open on</Label><Input id="f-o" type="date" value={opens} onChange={w(setOpens)} /></div>
          <div className="sm:col-span-2"><Label htmlFor="f-x">Description</Label><Textarea id="f-x" rows={3} value={desc} onChange={w(setDesc)} /></div>
          <label className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" className="h-5 w-5" checked={active} onChange={(e) => { setTouched(true); setActive(e.target.checked); }} />Show on the feast calendar</label>
        </div>
        <ErrorBar errors={errors} show={touched} />
        <DialogFooter><Button variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button><Button disabled={errors.length > 0 || pending} onClick={() => onSave({ name: name.trim(), marathiName: mr.trim() || null, date, preorderOpensOn: opens || null, description: desc.trim() || null, active, workflowCode: FEAST })}>{pending ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminFeastDatesPage() {
  const { data } = useAdminList('feasts', adminApi.feasts);
  const save = useAdminMutation('feasts', (a: { id: number | null; b: Partial<FeastDate> }) => adminApi.saveFeast(a.id, a.b), 'Feast date saved');
  const del = useAdminMutation('feasts', adminApi.deleteFeast, 'Feast date deleted');
  const [edit, setEdit] = useState<FeastDate | 'new' | null>(null);
  const cols = useMemo<ColDef<FeastDate>[]>(() => [
    { field: 'date', headerName: 'Date' }, { field: 'name', headerName: 'Name' }, { field: 'marathiName', headerName: 'Marathi' },
    { field: 'preorderOpensOn', headerName: 'Pre-orders open' }, { headerName: 'Shown', valueGetter: (p) => (p.data?.active ? 'Yes' : 'No') },
  ], []);
  return (
    <div>
      <AdminHead title="Feast calendar" hint="Festival and big-day dates shown to customers.">
        <Button onClick={() => setEdit('new')}>Add feast date</Button>
        <BulkUploadDialog title="Bulk upload feast dates" columns={['name', 'date', 'marathiName', 'preorderOpensOn', 'description']} sampleRow={['Ganesh Chaturthi', '2027-09-14', '', '2027-09-01', 'Festive thali orders']} templateName="feast-dates-template.csv" onUpload={adminApi.bulkFeasts} />
      </AdminHead>
      <AdminDataGrid<FeastDate> rowData={data ?? []} columnDefs={cols} emptyMessage="No feast dates yet." actions={[{ label: 'Edit', onClick: (f) => setEdit(f) }, { label: 'Delete', danger: true, onClick: (f) => del.mutate(f.id) }]} />
      {edit ? <FeastForm initial={edit === 'new' ? null : edit} pending={save.isPending} onClose={() => setEdit(null)} onSave={(b) => save.mutate({ id: edit === 'new' ? null : edit.id, b }, { onSuccess: () => setEdit(null) })} /> : null}
    </div>
  );
}
