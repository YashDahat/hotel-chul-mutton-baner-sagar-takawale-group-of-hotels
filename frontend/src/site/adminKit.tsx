import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ErrorBar, bad } from '@/site/form';

export function AdminHead({ title, hint, children }: { title: string; hint?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-bold">{title}</h1>{hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}</div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

/** One-value edit dialog; Save stays disabled until the value is valid, problems show in a single alert bar. */
export function ValueDialog({ open, title, label, kind, initial, min, max, required = true, pending, onSave, onClose }: {
  open: boolean; title: string; label: string; kind: 'number' | 'text' | 'textarea'; initial: string; min?: number; max?: number;
  required?: boolean; pending?: boolean; onSave: (v: string) => void; onClose: () => void;
}) {
  const [v, setV] = useState(initial);
  const [touched, setTouched] = useState(false);
  const errors: string[] = [];
  if (required && !v.trim()) errors.push(`${label} is required`);
  if (kind === 'number' && v.trim()) {
    const n = Number(v);
    if (Number.isNaN(n)) errors.push(`${label} must be a number`);
    else if ((min != null && n < min) || (max != null && n > max)) errors.push(`${label} must be between ${min ?? '−∞'} and ${max ?? '∞'}`);
  }
  if (kind !== 'number' && max != null && v.length > max) errors.push(`${label} can be up to ${max} characters`);
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !pending) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription className="sr-only">{label}</DialogDescription></DialogHeader>
        <div>
          <Label htmlFor="vd">{label}</Label>
          {kind === 'textarea'
            ? <Textarea id="vd" rows={5} className={bad(touched && errors.length > 0)} value={v} onChange={(e) => { setV(e.target.value); setTouched(true); }} />
            : <Input id="vd" type={kind === 'number' ? 'number' : 'text'} className={bad(touched && errors.length > 0)} value={v} onChange={(e) => { setV(e.target.value); setTouched(true); }} />}
        </div>
        <ErrorBar errors={errors} show={touched} />
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button disabled={errors.length > 0 || pending} onClick={() => onSave(v)}>{pending ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
