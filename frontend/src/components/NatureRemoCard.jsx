import { Snowflake, Television } from '@phosphor-icons/react';

const ICONS = { ac: Snowflake, tv: Television };

export function NatureRemoCard({ device, sendCommand }) {
  const Icon = ICONS[device.type] || Snowflake;
  const isOn = device.status === 'on';

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E3DC] rounded-xl px-3.5 py-3 flex items-center gap-3 hover:border-[#D4D1C8] transition-all duration-150">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: isOn ? '#EDF4FF' : '#F5F4F0' }}
      >
        <Icon className="w-4 h-4" style={{ color: isOn ? '#1A5FB4' : '#A8A69F' }} weight="bold" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1C1B18] truncate leading-tight">{device.name}</p>
        {device.type === 'ac' && isOn && (
          <p className="text-[10px] font-mono text-[#A8A69F] mt-0.5">
            {device.properties?.temperature}°C · {device.properties?.mode}
          </p>
        )}
        {device.type === 'tv' && isOn && (
          <p className="text-[10px] font-mono text-[#A8A69F] mt-0.5">
            Ch {device.properties?.channel} · Vol {device.properties?.volume}
          </p>
        )}
      </div>

      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: isOn ? '#1A5FB4' : '#D4D1C8' }} />

      <button
        onClick={() => sendCommand(device.id, isOn ? 'turn_off' : 'turn_on')}
        className="shrink-0 text-[11px] font-semibold text-[#6B6860] bg-[#F5F4F0] border border-[#E5E3DC] rounded-lg px-2.5 py-1 cursor-pointer transition-all duration-150 hover:bg-[#ECEAE3] active:scale-[0.97]"
      >
        {isOn ? 'Off' : 'On'}
      </button>
    </div>
  );
}