import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';

/** GSAP page-enter: stagger panels in (retries while lazy route chunks mount). Skips when prefers-reduced-motion. */
export function useReveal(ref: RefObject<HTMLElement>, key: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let done = false;
    const go = () => {
      if (done) return;
      const panels = el.querySelectorAll('.nf-panel, .nf-banner');
      if (!panels.length) return;
      done = true;
      gsap.fromTo(panels, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: { each: 0.035, amount: 0.5 }, ease: 'power2.out', clearProps: 'transform,opacity,visibility', overwrite: 'auto' });
    };
    const ts = [0, 80, 200, 450].map((ms) => window.setTimeout(go, ms));
    return () => { ts.forEach(clearTimeout); done = true; };
  }, [key, ref]);
}

export function countUp(el: HTMLElement, to: number, decimals = 0) {
  const fmt = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return () => undefined; }
  const o = { v: 0 };
  const t = gsap.to(o, { v: to, duration: 1.1, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); } });
  return () => { t.kill(); el.textContent = fmt(to); };
}
