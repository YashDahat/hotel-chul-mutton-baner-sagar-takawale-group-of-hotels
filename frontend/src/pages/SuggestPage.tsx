import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEarnRules, useMySuggestions, usePublicIdeas, useSendSuggestion } from '@/site/api';
import { ErrorBar, bad, selectCls } from '@/site/form';
import { Chapter } from '@/site/ui';
import { usePageTitle } from '@/site/seo';

const CATS = [['menu', 'A dish or the menu'], ['service', 'Service or ordering'], ['site', 'This website'], ['other', 'Something else']];
const STATUS: Record<string, string> = { NEW: 'Received', PLANNED: 'Planned', DONE: 'Done' };

export default function SuggestPage() {
  usePageTitle('Suggest an idea');
  const { isAuthenticated } = useAuth();
  const { data: ideas } = usePublicIdeas();
  const { data: mine } = useMySuggestions(isAuthenticated);
  const { data: rules } = useEarnRules();
  const send = useSendSuggestion();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('menu');
  const [touched, setTouched] = useState(false);
  const coins = rules?.find((r) => r.eventType === 'SUGGESTION')?.points;
  const errors: string[] = [];
  if (text.trim().length < 5) errors.push('Write at least 5 characters');
  if (text.trim().length > 500) errors.push('Keep it under 500 characters');
  return (
    <div className="page page--narrow space-y-10">
      <Chapter no="०८" eyebrow="Suggest an idea" title="Tell the kitchen">
        Every idea is read by the team. Ideas we plan or finish show up below.{coins ? ` Sending one earns ${coins} coins.` : ''}
      </Chapter>
      {isAuthenticated ? (
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (errors.length) { setTouched(true); return; } send.mutate({ text: text.trim(), category }, { onSuccess: () => { setText(''); setTouched(false); } }); }}>
          <div><Label htmlFor="s-cat">About</Label><select id="s-cat" className={selectCls} value={category} onChange={(e) => setCategory(e.target.value)}>{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div><Label htmlFor="s-text">Your idea</Label><Textarea id="s-text" rows={4} maxLength={500} className={bad(touched && errors.length > 0)} value={text} onChange={(e) => { setText(e.target.value); setTouched(true); }} /></div>
          <ErrorBar errors={errors} show={touched} />
          <Button type="submit" className="btn-ember" disabled={send.isPending || errors.length > 0}>{send.isPending ? 'Sending…' : 'Send idea'}</Button>
        </form>
      ) : (
        <p className="rounded-sm border p-4"><Link to={`/login?redirect=${encodeURIComponent('/suggest')}`} className="underline underline-offset-4">Sign in</Link> to send an idea (so we can thank you with coins).</p>
      )}
      {isAuthenticated && mine && mine.length > 0 ? (
        <section><h2 className="font-display mb-3 text-xl">Your ideas</h2><ul className="space-y-2">{mine.map((s) => <li key={s.id} className="rounded-sm border bg-card p-3 text-sm"><span className="font-semibold">{STATUS[s.status] ?? s.status}</span> — {s.text}{s.publicNote ? <span className="block text-muted-foreground">Team: {s.publicNote}</span> : null}</li>)}</ul></section>
      ) : null}
      <section>
        <h2 className="font-display mb-3 text-xl">Ideas in progress</h2>
        {ideas && ideas.length > 0 ? <ul className="space-y-2">{ideas.map((s) => <li key={s.id} className="rounded-sm border bg-card p-3 text-sm"><span className="font-semibold">{STATUS[s.status] ?? s.status}</span> — {s.text}{s.publicNote ? <span className="block text-muted-foreground">{s.publicNote}</span> : null}</li>)}</ul> : <p className="text-muted-foreground">Nothing posted yet — yours could be first.</p>}
      </section>
    </div>
  );
}
