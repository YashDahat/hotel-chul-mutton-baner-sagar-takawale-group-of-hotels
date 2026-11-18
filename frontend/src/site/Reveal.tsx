// Quiet scroll reveal: content is always visible without JS; with JS + motion allowed, it settles into view once.
import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

let armed = false;

function arm(): boolean {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (!armed) {
    document.documentElement.classList.add('reveal-ready');
    armed = true;
  }
  return true;
}

export default function Reveal({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: ElementType }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !arm()) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${className}`}>{children}</Tag>;
}
