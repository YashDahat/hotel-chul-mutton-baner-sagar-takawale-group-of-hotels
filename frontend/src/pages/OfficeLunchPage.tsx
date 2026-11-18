import { Link } from 'react-router-dom';
import { Chapter } from '@/site/ui';
import { usePageTitle } from '@/site/seo';

const steps = [
  ['Pick the thalis', 'Add one dish per person from the order page — vegetarian and non-veg can share one order.'],
  ['Tick "team lunch"', 'At checkout choose 2 to 15 boxes and type each person’s name. Every box is labelled before it leaves the kitchen.'],
  ['Choose a time', 'Pick the slot your team sits down. We pack to that minute, not before.'],
  ['Share the link', 'Send the tracking page to the group on WhatsApp so everyone knows when lunch is ready.'],
];

export default function OfficeLunchPage() {
  usePageTitle('Office lunch');
  return (
    <div className="page page--text space-y-8">
      <Chapter no="०४" eyebrow="Office lunch" title="Lunch for the whole team">
        Balewadi and Baner offices: one order, many labelled boxes, ready when you are. For more than 15 boxes, send a <Link to="/party" className="underline underline-offset-4">party request</Link> instead.
      </Chapter>
      <ol className="space-y-4">
        {steps.map(([h, b], i) => (
          <li key={h} className="flex gap-4"><span className="hanko hanko--sm hanko--light" aria-hidden="true">{i + 1}</span><div><h2 className="font-bold">{h}</h2><p className="text-muted-foreground">{b}</p></div></li>
        ))}
      </ol>
      <p><Link to="/order" className="btn-ember">Start a team order</Link></p>
    </div>
  );
}
