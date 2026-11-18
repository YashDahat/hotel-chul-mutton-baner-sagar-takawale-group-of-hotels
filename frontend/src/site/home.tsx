// Home-page building blocks: welcome band, live earn rules, get-started checklist.
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLoyaltyMe } from '@/hooks/loyaltyHooks';
import { useMyOrders } from '@/hooks/orderHooks';
import { useEarnRules } from '@/site/api';
import Reveal from '@/site/Reveal';

const EARN_LABEL: Record<string, { text: string; to: string }> = {
  SIGNUP: { text: 'Create your account', to: '/signup' },
  PROFILE_COMPLETE: { text: 'Complete your profile', to: '/account' },
  PURCHASE: { text: 'Place an order', to: '/order' },
  REVIEW: { text: 'Review a dish', to: '/reviews' },
  REVIEW_MEDIA: { text: 'Add a photo to your review', to: '/reviews' },
  FEEDBACK: { text: 'Rate your order (any rating counts)', to: '/orders' },
  SUGGESTION: { text: 'Suggest an idea', to: '/suggest' },
  SHARE_CLICK: { text: 'Share the menu with friends', to: '/menu' },
  REFERRAL_SIGNUP: { text: 'Bring a friend', to: '/signup' },
  NOTIF_OPT_IN: { text: 'Turn on offer notes', to: '/account' },
};

export function WaysToEarn() {
  const { data } = useEarnRules();
  const rows = (data ?? []).filter((r) => EARN_LABEL[r.eventType] && r.points > 0);
  if (rows.length === 0) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => {
        const l = EARN_LABEL[r.eventType];
        return (
          <li key={r.eventType}>
            <Link to={l.to} className="flex min-h-11 items-center justify-between gap-3 rounded-sm border bg-card px-4 py-3 text-card-foreground hover:border-primary">
              <span>{l.text}</span>
              <span className="whitespace-nowrap font-display text-lg">+{r.points}{r.onceOnly ? ' once' : ''}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function CoinsLine() {
  const { data } = useLoyaltyMe();
  if (!data) return null;
  return (
    <p className="text-lg">
      You have <strong className="font-display text-2xl">{data.coinBalance}</strong> reward coins{data.tierName ? ` · ${data.tierName}` : ''}. Use them at checkout.
    </p>
  );
}

function Checklist() {
  const { data: orders } = useMyOrders();
  const items = [
    { done: true, text: 'Account created', to: '/account' },
    { done: (orders ?? []).length > 0, text: 'Place your first order', to: '/order' },
    { done: (orders ?? []).some((o) => o.workflowCode === 'table-booking'), text: 'Book a table', to: '/book' },
    { done: (orders ?? []).some((o) => o.feedbackSubmitted), text: 'Rate an order', to: '/orders' },
  ];
  return (
    <ul className="space-y-2" aria-label="Get started">
      {items.map((i) => (
        <li key={i.text}>
          <Link to={i.to} className="flex min-h-11 items-center gap-3">
            <span className={`hanko hanko--sm hanko--light ${i.done ? 'hanko--done' : ''}`} aria-hidden="true">{i.done ? '✓' : ''}</span>
            <span className={i.done ? 'text-muted-foreground line-through' : 'underline underline-offset-4'}>{i.text}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Warm greeting: a guest is invited in; a returning customer sees their coins and a short checklist. */
export function WelcomeBand() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="band-washi" aria-label="Welcome">
      <div className="site-container section">
        <Reveal>
          {isAuthenticated ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div><p className="chapter-no">Welcome back</p><h2 className="font-display h-chapter mt-2">The chul is lit. नमस्कार.</h2><div className="mt-4"><CoinsLine /></div></div>
              <div><p className="chapter-no mb-2">Get started</p><Checklist /></div>
            </div>
          ) : (
            <div className="max-w-3xl">
              <p className="chapter-no">नमस्कार · Welcome</p>
              <h2 className="font-display h-chapter mt-2">New here? Come in, sit by the fire.</h2>
              <p className="mt-3 text-muted-foreground">Browse the menu freely — no account needed. Make one to order, book tables and collect reward coins.</p>
              <p className="mt-4 flex flex-wrap gap-3"><Link to="/signup" className="btn-ember">Create an account</Link><Link to="/menu" className="btn-ghost-line">Just look at the menu</Link></p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
