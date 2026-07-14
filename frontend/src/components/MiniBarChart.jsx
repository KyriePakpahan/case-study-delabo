/* MiniBarChart — embedded in stat cards, Lumos-style */
export function MiniBarChart({ data = [], color = '#E8361E' }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-10 mt-1">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bar-anim"
          style={{
            height: `${(v / max) * 100}%`,
            backgroundColor: i >= data.length - 3 ? color : '#ECEAE3',
            animationDelay: `${i * 35}ms`,
          }}
        />
      ))}
    </div>
  );
}
