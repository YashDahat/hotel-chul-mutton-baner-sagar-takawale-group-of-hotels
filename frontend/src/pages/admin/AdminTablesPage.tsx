import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AdminDataGrid } from '@/components/admin/AdminDataGrid';
import { BulkUploadDialog } from '@/components/admin/BulkUploadDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableSlot, adminApi, useAdminList, useAdminMutation } from '@/site/api';
import { AdminHead, ValueDialog } from '@/site/adminKit';
import { ErrorBar, bad } from '@/site/form';
import { fmtTime } from '@/site/ui';

export default function AdminTablesPage() {
  const { data } = useAdminList('slots', adminApi.slots);
  const add = useAdminMutation('slots', adminApi.addSlot, 'Time added');
  const upd = useAdminMutation('slots', (a: { id: number; b: { tables?: number; active?: boolean } }) => adminApi.updateSlot(a.id, a.b), 'Time updated');
  const del = useAdminMutation('slots', adminApi.deleteSlot, 'Time removed');
  const gen = useAdminMutation('slots', adminApi.generateSlots, 'Times generated');
  const [days, setDays] = useState(14);
  const [date, setDate] = useState(''); const [time, setTime] = useState('13:00'); const [tables, setTables] = useState(4);
  const [edit, setEdit] = useState<TableSlot | null>(null);
  const errors: string[] = [];
  if (days < 1 || days > 30) errors.push('Days must be between 1 and 30');
  if (tables < 1 || tables > 100) errors.push('Tables must be between 1 and 100');
  const cols = useMemo<ColDef<TableSlot>[]>(() => [
    { field: 'date', headerName: 'Date' }, { headerName: 'Time', valueGetter: (p) => fmtTime(p.data?.time) },
    { field: 'tables', headerName: 'Tables' }, { field: 'reserved', headerName: 'Booked' }, { field: 'left', headerName: 'Left' },
    { headerName: 'Open for booking', valueGetter: (p) => (p.data?.active ? 'Yes' : 'No') },
  ], []);
  return (
    <div>
      <AdminHead title="Table times" hint="Each time has a number of tables. A booking takes one; a full time can no longer be booked.">
        <BulkUploadDialog title="Bulk upload table times" columns={['date', 'time', 'tables']} sampleRow={['2026-12-01', '13:00', '4']} templateName="table-times-template.csv" onUpload={adminApi.bulkSlots} />
      </AdminHead>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div><Label htmlFor="t-days">Fill the next (days)</Label><Input id="t-days" type="number" className={`min-h-11 w-28 ${bad(days < 1 || days > 30)}`} value={days} onChange={(e) => setDays(Number(e.target.value))} /></div>
        <Button variant="outline" disabled={days < 1 || days > 30 || gen.isPending} onClick={() => gen.mutate(days)}>Generate usual times</Button>
        <div><Label htmlFor="t-date">Date</Label><Input id="t-date" type="date" className="min-h-11" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><Label htmlFor="t-time">Time</Label><Input id="t-time" type="time" className="min-h-11" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        <div><Label htmlFor="t-n">Tables</Label><Input id="t-n" type="number" className={`min-h-11 w-24 ${bad(tables < 1 || tables > 100)}`} value={tables} onChange={(e) => setTables(Number(e.target.value))} /></div>
        <Button disabled={!date || !time || tables < 1 || tables > 100 || add.isPending} onClick={() => add.mutate({ date, time, tables })}>Add time</Button>
      </div>
      <div className="mb-3"><ErrorBar errors={errors} show={errors.length > 0} /></div>
      <AdminDataGrid<TableSlot> rowData={data ?? []} columnDefs={cols} emptyMessage="No table times yet."
        actions={[
          { label: 'Change tables', onClick: (s) => setEdit(s) },
          { label: 'Close for booking', onClick: (s) => upd.mutate({ id: s.id, b: { active: false } }), hidden: (s) => !s.active },
          { label: 'Reopen for booking', onClick: (s) => upd.mutate({ id: s.id, b: { active: true } }), hidden: (s) => s.active },
          { label: 'Delete', danger: true, onClick: (s) => del.mutate(s.id) },
        ]} />
      {edit ? <ValueDialog key={edit.id} open title={`Tables — ${edit.date} ${fmtTime(edit.time)}`} label="Tables" kind="number" min={Math.max(edit.reserved, 1)} max={100} initial={String(edit.tables)} pending={upd.isPending}
        onClose={() => setEdit(null)} onSave={(v) => upd.mutate({ id: edit.id, b: { tables: Number(v) } }, { onSuccess: () => setEdit(null) })} /> : null}
    </div>
  );
}
