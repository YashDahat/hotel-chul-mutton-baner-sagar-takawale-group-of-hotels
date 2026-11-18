import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ColDef } from 'ag-grid-community';
import { AdminDataGrid } from '@/components/admin/AdminDataGrid';
import { Button } from '@/components/ui/button';
import { FEAST, OrderDetail, TABLE, adminApi, useAdminList, useAdminMutation } from '@/site/api';
import { AdminHead, ValueDialog } from '@/site/adminKit';
import { fmtDate, fmtTime, inr } from '@/site/ui';

function summary(d: OrderDetail): string {
  if (d.workflowCode === TABLE) return `${d.partySize ?? '?'} guests${d.occasion ? ` · ${d.occasion}` : ''}`;
  if (d.workflowCode === FEAST) return `${d.guestCount ?? '?'} guests (${d.vegGuestCount ?? 0} veg)${d.budgetPerHead ? ` · ₹${d.budgetPerHead}/head` : ''}${d.occasion ? ` · ${d.occasion}` : ''}`;
  return d.teamLunch ? `Team lunch: ${d.boxCount} boxes — ${(d.boxLabels ?? []).join(', ')}` : 'Single order';
}

/** Staff view of the process inputs behind orders of one workflow (slot, party, boxes, notes) with an internal note. */
export default function AdminDetailsPage({ workflow, title }: { workflow: string; title: string }) {
  const key = `details-${workflow}`;
  const { data } = useAdminList(key, () => adminApi.details(workflow));
  const save = useAdminMutation(key, (a: { orderId: number; note: string }) => adminApi.saveNote(a.orderId, a.note), 'Note saved');
  const [target, setTarget] = useState<OrderDetail | null>(null);
  const cols = useMemo<ColDef<OrderDetail>[]>(() => [
    { field: 'orderNumber', headerName: 'Order' },
    { field: 'stageCode', headerName: 'Stage' },
    { field: 'contactName', headerName: 'Name' },
    { field: 'phone', headerName: 'Phone' },
    { headerName: workflow === FEAST ? 'Event' : 'When', valueGetter: (p) => { const d = p.data; if (!d) return ''; const date = d.eventDate ?? d.slotDate; const time = d.eventTime ?? d.slotTime; return date ? `${fmtDate(date)} ${fmtTime(time)}` : ''; }, minWidth: 200 },
    { headerName: 'Details', valueGetter: (p) => (p.data ? summary(p.data) : ''), minWidth: 240 },
    { headerName: 'Total', valueGetter: (p) => (p.data?.total != null ? inr(p.data.total) : '') },
    { field: 'notes', headerName: 'Customer note' },
    { field: 'staffNote', headerName: 'Staff note' },
  ], [workflow]);
  return (
    <div>
      <AdminHead title={title} hint="Move orders between stages on the order board; add private notes for the team here.">
        <Button asChild variant="outline"><Link to="/admin/orders">Open order board</Link></Button>
      </AdminHead>
      <AdminDataGrid<OrderDetail> rowData={data ?? []} columnDefs={cols} emptyMessage="Nothing here yet." actions={[{ label: 'Staff note', onClick: (d) => setTarget(d) }]} />
      {target ? <ValueDialog key={target.orderId} open title={`Staff note — ${target.orderNumber ?? target.orderId}`} label="Note (only staff see this)" kind="textarea" required={false} max={1000} initial={target.staffNote ?? ''} pending={save.isPending}
        onClose={() => setTarget(null)} onSave={(v) => save.mutate({ orderId: target.orderId, note: v }, { onSuccess: () => setTarget(null) })} /> : null}
    </div>
  );
}
