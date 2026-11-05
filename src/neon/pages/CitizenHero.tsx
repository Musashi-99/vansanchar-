import type { ReactNode } from 'react';
import { MapPin } from 'lucide-react';

/** Wide banner used on citizen pages: location chip, big title with lime accent, subtitle, optional chips, tiger art on the right. */
export default function CitizenHero({ title, accent, sub, icon, bg = 'banner-sunset.jpg', children }: { title: string; accent?: string; sub: string; icon?: ReactNode; bg?: string; children?: ReactNode }) {
  return (
    <section className="nf-banner px-4 pb-5 pt-4 sm:px-8" style={{ ['--banner' as string]: `url(/img/${bg})` }}>
      <div className="mx-auto max-w-[1400px]">
        <span className="nf-pill !rounded-xl !bg-black/40 !py-1.5 text-[13.5px]"><MapPin className="h-4 w-4 text-[var(--nf-lime)]" />Sundarbans, West Bengal</span>
        <div className="mt-3 flex items-center gap-3">
          {icon && <span className="shrink-0 text-[var(--nf-lime)] [&>svg]:h-11 [&>svg]:w-11">{icon}</span>}
          <h1 className="nf-title text-[40px] leading-tight sm:text-[48px]">{title}{accent && <> <em>{accent}</em></>}</h1>
        </div>
        <p className="mt-1 max-w-[680px] text-[18px] text-[#e4f2dc]">{sub}</p>
        {children && <div className="mt-4 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
