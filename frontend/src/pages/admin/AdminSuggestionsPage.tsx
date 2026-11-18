import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AdminDataGrid } from '@/components/admin/AdminDataGrid';
import { BulkUploadDialog } from '@/components/admin/BulkUploadDialog';
import { Suggestion, adminApi, useAdminList, useAdminMutation } from '@/site/api';
import { AdminHead, ValueDialog } from '@/site/adminKit';

type Triage = { id: number; b: { status?: string; publicNote?: string; showPublic?: boolean } };

export default function AdminSuggestionsPage() {
  const { data } = useAdminList('suggestions', adminApi.suggestions);
  const triage = useAdminMutation('suggestions', (a: Triage) => adminApi.triage(a.id, a.b), 'Idea updated');
  const [noteFor, setNoteFor] = useState<Suggestion | null>(null);
  const cols = useMemo<ColDef<Suggestion>[]>(() => [
    { field: 'createdAt', headerName: 'Received', valueFormatter: (p) => String(p.value ?? '').slice(0, 10) },
    { field: 'category', headerName: 'About' }, { field: 'text', headerName: 'Idea', flex: 3, minWidth: 280 },
    { field: 'status', headerName: 'Status' }, { headerName: 'Public', valueGetter: (p) => (p.data?.showPublic ? 'Yes' : 'No') }, { field: 'publicNote', headerName: 'Team note' },
  ], []);
  return (
    <div>
      <AdminHead title="Customer ideas" hint="Mark ideas Planned or Done and publish the ones you want customers to see.">
        <BulkUploadDialog title="Bulk upload ideas" columns={['text', 'category', 'status']} sampleRow={['Add a veg thali combo', 'menu', 'NEW']} templateName="ideas-template.csv" onUpload={adminApi.bulkSuggestions} />
      </AdminHead>
      <AdminDataGrid<Suggestion> rowData={data ?? []} columnDefs={cols} emptyMessage="No ideas yet."
        actions={[
          { label: 'Mark planned', onClick: (s) => triage.mutate({ id: s.id, b: { status: 'PLANNED' } }) },
          { label: 'Mark done', onClick: (s) => triage.mutate({ id: s.id, b: { status: 'DONE' } }) },
          { label: 'Show publicly', onClick: (s) => triage.mutate({ id: s.id, b: { showPublic: true } }), hidden: (s) => s.showPublic },
          { label: 'Hide from public', onClick: (s) => triage.mutate({ id: s.id, b: { showPublic: false } }), hidden: (s) => !s.showPublic },
          { label: 'Write team note', onClick: (s) => setNoteFor(s) },
        ]} />
      {noteFor ? <ValueDialog key={noteFor.id} open title="Note customers will see" label="Note" kind="textarea" required={false} max={300} initial={noteFor.publicNote ?? ''} pending={triage.isPending}
        onClose={() => setNoteFor(null)} onSave={(v) => triage.mutate({ id: noteFor.id, b: { publicNote: v } }, { onSuccess: () => setNoteFor(null) })} /> : null}
    </div>
  );
}
