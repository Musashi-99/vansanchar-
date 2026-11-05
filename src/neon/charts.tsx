import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AX = { stroke: '#a9c79d', fontSize: 11, tickLine: false, axisLine: { stroke: 'rgba(255,255,255,.2)' } } as const;
const TT = { contentStyle: { background: '#0b2a14', border: '1px solid rgba(126,211,33,.4)', borderRadius: 10, color: '#fff', fontSize: 12 }, cursor: { stroke: 'rgba(255,255,255,.2)' } };
type Row = Record<string, number | string>;

export function AreaTwo({ data, keys, height = 190, yTicks, fmt }: { data: Row[]; keys: { k: string; c: string }[]; height?: number; yTicks?: number[]; fmt?: (n: number) => string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
        <defs>{keys.map((k) => <linearGradient key={k.k} id={`g-${k.k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={k.c} stopOpacity={0.55} /><stop offset="1" stopColor={k.c} stopOpacity={0.05} /></linearGradient>)}</defs>
        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
        <XAxis dataKey="x" {...AX} interval="preserveStartEnd" /><YAxis {...AX} ticks={yTicks} tickFormatter={fmt} width={42} />
        <Tooltip {...TT} />
        {keys.map((k) => <Area key={k.k} type="monotone" dataKey={k.k} stroke={k.c} strokeWidth={2} fill={`url(#g-${k.k})`} dot={{ r: 3, fill: k.c, strokeWidth: 0 }} />)}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StackBars({ data, keys, height = 190 }: { data: Row[]; keys: { k: string; c: string }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
        <XAxis dataKey="x" {...AX} /><YAxis {...AX} width={42} /><Tooltip {...TT} cursor={{ fill: 'rgba(255,255,255,.05)' }} />
        {keys.map((k) => <Bar key={k.k} dataKey={k.k} stackId="a" fill={k.c} radius={0} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Bars({ data, height = 190, color = '#8fdc2f', k = 'v' }: { data: Row[]; height?: number; color?: string; k?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -14, bottom: 0 }} barCategoryGap={2}>
        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
        <XAxis dataKey="x" {...AX} interval={Math.max(Math.floor(data.length / 8) - 1, 0)} /><YAxis {...AX} width={42} /><Tooltip {...TT} cursor={{ fill: 'rgba(255,255,255,.05)' }} />
        <Bar dataKey={k} fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Lines({ data, keys, height = 190, area, domain }: { data: Row[]; keys: { k: string; c: string }[]; height?: number; area?: boolean; domain?: [number, number] }) {
  if (area) return <AreaTwo data={data} keys={keys} height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
        <XAxis dataKey="x" {...AX} interval="preserveStartEnd" /><YAxis {...AX} width={42} domain={domain} /><Tooltip {...TT} />
        {keys.map((k) => <Line key={k.k} type="monotone" dataKey={k.k} stroke={k.c} strokeWidth={2} dot={{ r: 3, fill: k.c, strokeWidth: 0 }} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}

export const dates = ['6 Oct', '10 Oct', '14 Oct', '18 Oct', '22 Oct', '26 Oct', '30 Oct', '4 Nov'];
