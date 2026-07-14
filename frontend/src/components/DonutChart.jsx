export function DonutChart({ pct = 0, color = '#2D7B35', size = 52 }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="mt-2 flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 48 48">
        {/* Track */}
        <circle cx="24" cy="24" r={r} fill="none" stroke="#ECEAE3" strokeWidth="5" />
        {/* Fill */}
        <circle
          cx="24" cy="24" r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
        <text x="24" y="28" textAnchor="middle" fontSize="10" fontFamily="monospace" fill={color} fontWeight="600">
          {pct}%
        </text>
      </svg>
    </div>
  );
}
