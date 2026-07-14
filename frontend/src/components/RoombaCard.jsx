// dependencies
import { Broom, BatteryFull, BatteryHigh, BatteryMedium, BatteryLow, BatteryWarning } from '@phosphor-icons/react';

function BatteryIcon({ pct }) {
  if (pct > 80) return <BatteryFull className="w-3.5 h-3.5" />;
  if (pct > 60) return <BatteryHigh className="w-3.5 h-3.5" />;
  if (pct > 40) return <BatteryMedium className="w-3.5 h-3.5" />;
  if (pct > 20) return <BatteryLow className="w-3.5 h-3.5" />;
  return <BatteryWarning className="w-3.5 h-3.5" />;
}

const STATUS_MAP = {
  docked:    { bg: '#F5F4F0', dot: '#D4D1C8', label: 'Docked' },
  cleaning:  { bg: '#EDFAED', dot: '#2D7B35', label: 'Cleaning' },
  returning: { bg: '#FFF8E8', dot: '#F5820A', label: 'Returning' },
};

export function RoombaCard({ device, sendCommand }) {
  const style = STATUS_MAP[device.status] || STATUS_MAP.docked;
  const bat   = device.properties?.battery ?? 0;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E3DC] rounded-xl px-3.5 py-3 flex items-center gap-3 hover:border-[#D4D1C8] transition-all duration-150">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: style.bg }}>
        <Broom className="w-4 h-4 text-[#6B6860]" weight="bold" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1C1B18] truncate leading-tight">{device.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span style={{ color: bat < 20 ? '#E8361E' : '#A8A69F' }}>
            <BatteryIcon pct={bat} />
          </span>
          <p className="text-[10px] font-mono text-[#A8A69F]">
            {bat}%{device.properties?.bin_full ? ' · bin full' : ''}
          </p>
        </div>
      </div>

      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: style.dot }} />

      {device.status === 'docked' && (
        <button
          onClick={() => sendCommand(device.id, 'clean')}
          className="shrink-0 text-[11px] font-semibold text-[#6B6860] bg-[#F5F4F0] border border-[#E5E3DC] rounded-lg px-2.5 py-1 cursor-pointer hover:bg-[#ECEAE3] active:scale-[0.97] transition-all duration-150"
        >
          Clean
        </button>
      )}
      {device.status === 'cleaning' && (
        <button
          onClick={() => sendCommand(device.id, 'dock')}
          className="shrink-0 text-[11px] font-semibold text-[#E8361E] bg-[#FFF0EE] border border-[#E8361E]/20 rounded-lg px-2.5 py-1 cursor-pointer hover:bg-[#FFE0DC] active:scale-[0.97] transition-all duration-150"
        >
          Dock
        </button>
      )}
    </div>
  );
}