// Stamp timeline: each stage the order has reached gets a filled hanko; the current one presses in.
import type { StageEvent, StageView } from '@/site/api';
import { fmtDate, fmtTime } from '@/site/ui';

export default function OrderProgress({ stages, events, currentCode }: { stages: StageView[]; events: StageEvent[]; currentCode: string | null | undefined }) {
  const cancelled = currentCode === 'CANCELLED';
  const ordered = [...stages].sort((a, b) => a.ordinal - b.ordinal);
  const shown = ordered.filter((s) => (cancelled ? events.some((e) => e.stageCode === s.code) : s.code !== 'CANCELLED' && s.code !== 'NO_SHOW') || s.code === currentCode);
  const currentOrdinal = ordered.find((s) => s.code === currentCode)?.ordinal ?? -1;
  return (
    <ol className="relative space-y-5" aria-label="Order progress">
      {shown.map((s, i) => {
        const ev = events.find((e) => e.stageCode === s.code);
        const reached = !!ev || s.ordinal <= currentOrdinal;
        const current = s.code === currentCode;
        const when = ev ? new Date(ev.enteredAt) : null;
        return (
          <li key={s.code} className="relative flex items-start gap-4" aria-current={current ? 'step' : undefined}>
            {i < shown.length - 1 ? <span className="timeline-rule is-in absolute left-[1.3rem] top-11 h-[calc(100%-1rem)] w-px bg-border" aria-hidden="true" /> : null}
            <span className={`hanko hanko--sm hanko--light ${reached ? 'hanko--done' : ''} ${current ? 'stamp-press' : ''}`} aria-hidden="true">{reached ? '✓' : i + 1}</span>
            <div className="pt-1.5">
              <p className={`font-semibold ${reached ? '' : 'text-muted-foreground'}`}>{s.label}{current ? ' — now' : ''}</p>
              {when ? <p className="text-sm text-muted-foreground">{fmtDate(when.toISOString())}, {fmtTime(`${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}`)}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
