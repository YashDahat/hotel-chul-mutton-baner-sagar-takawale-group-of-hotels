import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/productHooks';
import { contact } from '@/config/siteConfig';
import { CHUL } from '@/site/api';
import Reveal from '@/site/Reveal';
import { Chapter, DishCard, KitchenStatusStrip, RatingHanko } from '@/site/ui';
import { WaysToEarn, WelcomeBand } from '@/site/home';
import { usePageTitle } from '@/site/seo';

const ways = [
  { no: '०१', title: 'Order for pickup', body: 'Choose your dishes and a time. Watch it move from the chul to the counter.', to: '/order', cta: 'Order now' },
  { no: '०२', title: 'Book a table', body: 'Free to book. Pick a day, a time and how many of you.', to: '/book', cta: 'Book a table' },
  { no: '०३', title: 'Party orders', body: 'Weddings, birthdays, office feasts. Send a request, we call with a quote.', to: '/party', cta: 'Plan a feast' },
  { no: '०४', title: 'Office lunch', body: 'Labelled boxes for 2 to 15 people, ready when your team is.', to: '/office-lunch', cta: 'Team lunch' },
];

export default function HomePage() {
  usePageTitle('Mutton thali on the chul, Baner, Pune');
  const { data: products } = useProducts();
  const picks = (products ?? []).filter((p) => p.active && (p.workflowCode ?? CHUL) === CHUL).slice(0, 6);
  return (
    <>
      <KitchenStatusStrip />
      <section className="band-soot hero-glow overflow-hidden" aria-label="Hotel Chul Mutton">
        <div className="site-container grid items-center gap-8 py-12 md:grid-cols-[1fr_auto] md:py-20">
          <div className="ember-rise">
            <p className="chapter-no">Hotel Chul Mutton · Baner, Pune</p>
            <h1 className="font-display hero-title mt-3">Mutton, slow-cooked on the chul.</h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">Maharashtrian thalis, handi mutton and sukka, jowar bhakri and solkadhi — cooked over a wood fire on Balewadi High Street.</p>
            <p className="mt-7 flex flex-wrap items-center gap-4">
              <Link to="/order" className="btn-ember" data-testid="home-order">Order for pickup</Link>
              <Link to="/book" className="btn-ghost-line" data-testid="home-book">Book a table</Link>
              <Link to="/party" className="btn-ghost-line" data-testid="home-party">Party orders</Link>
            </p>
            <div className="mt-8"><RatingHanko /></div>
          </div>
          <div className="chul-glyph hidden md:block" aria-hidden="true" lang="mr">चूल</div>
        </div>
      </section>

      <WelcomeBand />

      <section className="band-washi">
        <div className="site-container section">
          <Chapter no="०१" eyebrow="Ways to eat" title="Four ways to eat with us" />
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ways.map((w) => (
              <li key={w.to}><Reveal className="flex h-full flex-col rounded-sm border bg-card p-5 text-card-foreground">
                <p className="chapter-no">{w.no}</p>
                <h3 className="font-display mt-1 text-xl">{w.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{w.body}</p>
                <Link to={w.to} className="btn-ember mt-4">{w.cta}</Link>
              </Reveal></li>
            ))}
          </ul>
        </div>
      </section>

      {picks.length > 0 ? (
        <section className="site-container section">
          <Chapter no="०२" eyebrow="From the chul" title="What we are known for" />
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{picks.map((p) => <li key={p.id}><DishCard p={p} /></li>)}</ul>
          <p className="mt-6"><Link to="/menu" className="btn-ghost-line">See the full menu</Link></p>
        </section>
      ) : null}

      <section className="band-clay">
        <div className="site-container section">
          <Chapter no="०३" eyebrow="Reward coins" title="Little thank-yous, for doing what you would do anyway">
            Coins are earned for taking part — never for a good rating. Spend them at checkout. <Link to="/loyalty-terms" className="underline underline-offset-4">How it works</Link>.
          </Chapter>
          <WaysToEarn />
        </div>
      </section>

      <section className="site-container section">
        <Chapter no="०४" eyebrow="Visit" title="Find the fire" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2"><p>{contact.address}</p><p>{contact.hours}</p><p><a className="underline underline-offset-4" href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a></p></div>
          <p className="flex flex-wrap items-start gap-3"><a className="btn-ember" href={contact.directionsUrl} target="_blank" rel="noopener noreferrer">Get directions</a><Link to="/story" className="btn-ghost-line">Our story</Link><Link to="/suggest" className="btn-ghost-line">Suggest an idea</Link></p>
        </div>
      </section>
    </>
  );
}
