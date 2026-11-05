import { useRef } from 'react';
import { TopNav } from '../../neon/Shells';
import { useReveal } from '../../neon/motion';
import HomeView from '../../neon/pages/HomeView';

export default function Landing() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, 'landing');
  return (
    <div ref={ref} className="nf min-h-dvh">
      <header className="sticky top-0 z-40 bg-gradient-to-b from-[#06150b] to-transparent backdrop-blur-[2px]"><TopNav guest /></header>
      <HomeView />
    </div>
  );
}
