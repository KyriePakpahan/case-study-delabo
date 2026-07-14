import { LightbulbFilament, Lock, LockOpen, Thermometer, HandPointing } from '@phosphor-icons/react';

const ICON_MAP = {
  lamp:     { on: LightbulbFilament, off: LightbulbFilament },
  lock:     { locked: Lock, unlocked: LockOpen },
  humidity: { default: Thermometer },
  bot:      { default: HandPointing },
};

const STATUS = {
  on:       { bg: '#EDFAED', text: '#2D7B35', dot: '#2D7B35' },
  off:      { bg: '#F5F4F0', text: '#A8A69F', dot: '#D4D1C8' },
  locked:   { bg: '#FFF8E8', text: '#9B6800', dot: '#F5820A' },
  unlocked: { bg: '#EDFAED', text: '#2D7B35', dot: '#2D7B35' },
  active:   { bg: '#EDFAED', text: '#2D7B35', dot: '#2D7B35' },
  pressing: { bg: '#FFF0EE', text: '#E8361E', dot: '#E8361E' },
};

function getIcon(type, status) {
  const map = ICON_MAP[type] || {};
  return map[status] || map.on || map.default || HandPointing;
}

export function SwitchBotCard({ device, sendCommand }) {
  const style = STATUS[device.status] || STATUS.off;
  const Icon  = getIcon(device.type, device.status);

  const handleToggle = () => {
    if (device.type === 'lamp')   sendCommand(device.id, device.status === 'on' ? 'turn_off' : 'turn_on');
    if (device.type === 'lock')   sendCommand(device.id, device.status === 'locked' ? 'unlock' : 'lock');
    if (device.type === 'bot')    sendCommand(device.id, 'press');
  };

  const btnLabel = device.type === 'bot'
    ? 'Press'
    : device.type === 'lock'
      ? (device.status === 'locked' ? 'Unlock' : 'Lock')
      : (device.status === 'on' ? 'Off' : 'On');

  return (
    <div className="group bg-[#FFFFFF] border border-[#E5E3DC] rounded-xl px-3.5 py-3 flex items-center gap-3 hover:border-[#D4D1C8] transition-all duration-150">
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: style.bg }}>
        <Icon className="w-4 h-4" style={{ color: style.text }} weight="bold" />
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1C1B18] truncate leading-tight">{device.name}</p>
        {device.type === 'humidity' && (
          <p className="text-[10px] font-mono text-[#A8A69F] mt-0.5">
            {device.properties?.temperature}°C · {device.properties?.humidity}%
          </p>
        )}
        {device.type === 'lamp' && device.status === 'on' && device.properties?.brightness && (
          <p className="text-[10px] font-mono text-[#A8A69F] mt-0.5">
            {device.properties.brightness}% brightness
          </p>
        )}
      </div>

      {/* Status dot */}
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: style.dot }} />

      {/* Toggle button */}
      {device.type !== 'humidity' && (
        <button
          onClick={handleToggle}
          className="shrink-0 text-[11px] font-semibold text-[#6B6860] bg-[#F5F4F0] border border-[#E5E3DC] rounded-lg px-2.5 py-1 cursor-pointer transition-all duration-150 hover:bg-[#ECEAE3] active:scale-[0.97]"
        >
          {btnLabel}
        </button>
      )}
    </div>
  );
}