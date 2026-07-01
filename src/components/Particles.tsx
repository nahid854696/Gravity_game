import { useMemo } from 'react';

export default function Particles({ count = 40 }: { count?: number }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      tx: (Math.random() - 0.5) * 400,
      ty: (Math.random() - 0.5) * 400,
      dur: 8 + Math.random() * 12,
      delay: Math.random() * -20,
      size: Math.random() < 0.3 ? 3 : 2,
      color: Math.random() < 0.5 ? '#00f0ff' : (Math.random() < 0.5 ? '#b026ff' : '#ffffff'),
    }));
  }, [count]);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div key={p.id} className="particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            ['--tx' as any]: `${p.tx}px`,
            ['--ty' as any]: `${p.ty}px`,
            ['--dur' as any]: `${p.dur}s`,
            ['--delay' as any]: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
