import { Link } from 'react-router-dom';
import { useFeastDates } from '@/site/api';
import { Chapter, WhatsAppShare, fmtDate } from '@/site/ui';
import { usePageTitle } from '@/site/seo';

export default function FeastCalendarPage() {
  usePageTitle('Feast calendar');
  const { data, isLoading } = useFeastDates();
  const list = (data ?? []).filter((f) => f.active);
  return (
    <div className="page page--narrow space-y-8">
      <Chapter no="०५" eyebrow="Feast calendar" title="Days we cook for crowds">
        Festival and big-day dates when the kitchen takes party orders. Dates are posted by the hotel.
      </Chapter>
      {isLoading ? <p>Loading…</p> : list.length === 0 ? (
        <p className="rounded-sm border p-4" role="status">No feast dates are posted yet. You can still <Link to="/party" className="underline underline-offset-4">send a party request</Link> for any date.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((f) => (
            <li key={f.id} className="rounded-sm border bg-card p-4">
              <p className="chapter-no">{fmtDate(f.date)}</p>
              <h2 className="font-display text-2xl">{f.name}{f.marathiName ? <span lang="mr" className="ml-3 text-lg text-muted-foreground">{f.marathiName}</span> : null}</h2>
              {f.description ? <p className="mt-1 text-muted-foreground">{f.description}</p> : null}
              {f.preorderOpensOn ? <p className="mt-1 text-sm">Pre-orders open {fmtDate(f.preorderOpensOn)}</p> : null}
              <div className="mt-3 flex flex-wrap gap-3"><Link to="/party" className="btn-ember">Plan a feast</Link><WhatsAppShare text={`${f.name} on ${fmtDate(f.date)} at Hotel Chul Mutton, Baner`} label="Share" /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
