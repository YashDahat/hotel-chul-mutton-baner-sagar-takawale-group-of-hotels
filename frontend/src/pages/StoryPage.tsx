import { Link } from 'react-router-dom';
import Reveal from '@/site/Reveal';
import { Chapter, RatingHanko } from '@/site/ui';
import { usePageTitle } from '@/site/seo';

const beats = [
  ['The chul', 'चूल is the traditional wood-fired hearth of Maharashtra. Cooking on it is slow and patient: the handi sits on the flame, the mutton takes its time, and the smoke becomes part of the dish.'],
  ['The handi', 'The signature is mutton cooked in a handi — a heavy pot that holds heat evenly. A limited number are made each day, which is why the kitchen board shows how many are left.'],
  ['The thali', 'Around it, a Maharashtrian plate: sukka and rassa, jowar bhakri, tandoor roti, indrayani rice, and solkadhi to cool things down.'],
  ['The Baner hotel', 'Hotel Chul Mutton, a Sagar Takawale Group hotel, is on Balewadi High Street, Baner, Pune — a short walk from the office towers and a long drive for the neighbourhoods that come for lunch.'],
  ['Ten thousand voices', 'Thousands of Google reviews, and a 4.6 average. We read them. If you have an idea, tell us.'],
];

export default function StoryPage() {
  usePageTitle('Our story');
  return (
    <div className="page page--narrow space-y-10">
      <Chapter no="०६" eyebrow="Our story" title="Fire first, everything else after" />
      <ol className="space-y-8">
        {beats.map(([h, b], i) => (
          <li key={h}><Reveal className="flex gap-4">
            <span className="chapter-no pt-2">{String(i + 1).padStart(2, '0')}</span>
            <div><h2 className="font-display text-2xl">{h}</h2><p className="mt-2 text-muted-foreground">{b}</p></div>
          </Reveal></li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-6"><RatingHanko /><Link to="/order" className="btn-ember">Taste it</Link><Link to="/suggest" className="btn-ghost-line">Tell us what to cook next</Link></div>
    </div>
  );
}
