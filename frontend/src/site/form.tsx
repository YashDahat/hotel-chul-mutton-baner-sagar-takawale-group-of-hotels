// Tiny form helpers: one red alert bar for all problems, red borders on bad fields.
import { cn } from '@/lib/utils';

export function ErrorBar({ errors, show = true }: { errors: string[]; show?: boolean }) {
  if (!show || errors.length === 0) return null;
  return (
    <div role="alert" className="rounded-sm border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
      <ul className="list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
    </div>
  );
}

export const bad = (isBad: boolean) => cn(isBad && 'border-destructive focus-visible:ring-destructive');

export const phoneOk = (v: string): boolean => {
  let d = v.replace(/[^0-9]/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9][0-9]{9}$/.test(d);
};

export const selectCls = 'h-11 w-full rounded-sm border border-input bg-background px-3 text-base';
