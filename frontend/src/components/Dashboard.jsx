// dependencies
import React, { useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  ArrowSquareOut, ArrowsClockwise,
  Broadcast, LightbulbFilament, Lock, Thermometer,
  Snowflake, Television, Broom, VideoCamera,
  WifiHigh, WifiNone, BatteryFull, ShieldCheck,
  TrendUp, ArrowUp, ArrowDown, Cube
} from '@phosphor-icons/react';

import { SwitchBotCard } from './SwitchBotCard';
import { NatureRemoCard } from './NatureRemoCard';
import { RoombaCard } from './RoombaCard';
import { CCTVViewer } from './CCTVViewer';
import { DigitalTwin } from './DigitalTwin';
import { MiniBarChart } from './MiniBarChart';
import { DonutChart } from './DonutChart';

// helpers
function now() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// stats
function StatCard({ label, value, suffix, sub, chart, color = '#E8361E', delay = 0 }) {
  return (
    <div
      className="fade-up bg-surface rounded-2xl border border-[#E5E3DC] p-5 flex flex-col gap-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium text-[#6B6860] uppercase tracking-wider">{label}</span>
        <ArrowSquareOut className="w-3.5 h-3.5 text-[#A8A69F]" />
      </div>
      <div>
        <span className="text-2xl font-semibold text-[#1C1B18] font-mono">{value}</span>
        {suffix && <span className="text-sm text-[#6B6860] ml-1">{suffix}</span>}
        {sub && <p className="text-[11px] text-[#A8A69F] mt-0.5">{sub}</p>}
      </div>
      {chart}
    </div>
  );
}

// system status panel
function SystemPanel({ connected, onlineCount, total }) {
  const barData = [3, 5, 4, 7, 6, 8, 5, 9, 6, 7, 8, 9];
  return (
    <div className="bg-surface rounded-2xl border border-[#E5E3DC] p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#1C1B18] tracking-tight">System Status</span>
        <ArrowSquareOut className="w-3.5 h-3.5 text-[#A8A69F]" />
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2.5 p-3 bg-[#F5F4F0] rounded-xl">
        {connected
          ? <WifiHigh className="w-5 h-5 text-[#2D7B35]" weight="fill" />
          : <WifiNone className="w-5 h-5 text-[#E8361E]" weight="fill" />
        }
        <div>
          <p className="text-xs font-semibold text-[#1C1B18] leading-none">{connected ? 'Connected' : 'Offline'}</p>
          <p className="text-[10px] text-[#A8A69F] mt-0.5">ws://localhost:8000</p>
        </div>
        <div className={`ml-auto w-2 h-2 rounded-full ${connected ? 'bg-[#2D7B35] pulse' : 'bg-[#E8361E]'}`} />
      </div>

      {/* Device Ratio */}
      <div>
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-[#6B6860]">Devices Online</span>
          <span className="font-mono font-medium text-[#1C1B18]">{onlineCount}/{total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#F5F4F0] overflow-hidden">
          <div
            className="h-full bg-[#E8361E] rounded-full transition-all duration-700"
            style={{ width: total > 0 ? `${(onlineCount / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Uptime Chart */}
      <div>
        <p className="text-[10px] text-[#A8A69F] mb-2">Activity (last 12 hrs)</p>
        <div className="flex items-end gap-0.5 h-10">
          {barData.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bar-anim"
              style={{
                height: `${(h / 10) * 100}%`,
                backgroundColor: i >= barData.length - 3 ? '#E8361E' : '#E5E3DC',
                animationDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-[#A8A69F]">1AM</span>
          <span className="text-[9px] text-[#A8A69F]">12PM</span>
        </div>
      </div>
    </div>
  );
}

// floating stat card
function FloatingStatCard({ count }) {
  return (
    <div className="absolute bottom-6 left-6 z-10 bg-surface border border-[#E5E3DC] rounded-2xl px-5 py-4 shadow-sm min-w-[140px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-[#6B6860] font-medium">Total Devices</span>
        <ArrowsClockwise className="w-3.5 h-3.5 text-[#A8A69F]" />
      </div>
      <p className="text-3xl font-mono font-semibold text-[#1C1B18]">{count}</p>
      <p className="text-[10px] text-[#A8A69F] mt-0.5">Connected endpoints</p>
    </div>
  );
}
// section label
function SectionLabel({ text, count }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A8A69F]">{text}</span>
      <span className="text-[10px] font-mono text-[#A8A69F] bg-[#F5F4F0] px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}


// main dashboard
export function Dashboard() {
  const { devices, connected, sendCommand } = useWebSocket();

  const switchbotDevices  = useMemo(() => devices.filter(d => d.ecosystem === 'switchbot'), [devices]);
  const natureRemoDevices = useMemo(() => devices.filter(d => d.ecosystem === 'nature_remo'), [devices]);
  const roombaDevices     = useMemo(() => devices.filter(d => d.ecosystem === 'roomba'), [devices]);

  const onlineCount = useMemo(
    () => devices.filter(d => d.status !== 'offline' && d.status !== 'off').length,
    [devices]
  );


  return (
    <div className="min-h-[100dvh] bg-[#F2F1ED]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Top Nav Bar*/}
      <nav className="sticky top-0 z-20 bg-[#F2F1ED]/90 backdrop-blur-md border-b border-[#E5E3DC]">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center gap-8">

          {/* Nav tabs */}
          <div className="flex items-center gap-1 bg-[#ECEAE3] rounded-xl px-1 py-1">
            {['Overview', 'Devices', 'Reports', 'Analytics'].map((tab, i) => (
              <button
                key={tab}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                  i === 0
                    ? 'bg-surface text-[#1C1B18] shadow-sm'
                    : 'text-[#6B6860] hover:text-[#1C1B18]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-[#2D7B35] pulse' : 'bg-[#E8361E]'}`} />
              <span className="text-[14px] text-[#6B6860]">{connected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-5">
        <div className="grid grid-cols-[280px_1fr_280px] gap-5 items-start">

          {/* Heading + Quick Actions + Device Cards (dummy)*/}
          <div className="row-span-2 flex flex-col gap-5">
            {/* Hero heading */}
            <div className="fade-up">
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  className="text-3xl font-medium leading-tight text-[#1C1B18] tracking-tight">
                Ward Control<br />Dashboard
              </h1>
              <p className="text-[13px] text-[#6B6860] mt-2 leading-relaxed">
                Monitor and Control Hospital Ward<br />IoT Devices in Real-Time.
              </p>
            </div>

            {/* Quick action buttons (dummy) */}
            <div className="fade-up d-80 flex items-center gap-2">
              {[
                { icon: <VideoCamera weight="bold" />, title: 'CCTV' },
                { icon: <LightbulbFilament weight="bold" />, title: 'Lights' },
                { icon: <ShieldCheck weight="bold" />, title: 'Security' },
                { icon: <TrendUp weight="bold" />, title: 'Reports' },
              ].map(({ icon, title }) => (
                <button
                  key={title}
                  title={title}
                  className="w-9 h-9 rounded-xl bg-surface border border-[#E5E3DC] flex items-center justify-center text-[#6B6860] hover:border-[#E8361E] hover:text-[#E8361E] transition-all duration-150 cursor-pointer"
                >
                  {React.cloneElement(icon, { className: 'w-4 h-4' })}
                </button>
              ))}
            </div>

            {/* SwitchBot */}
            <div className="fade-up d-160">
              <SectionLabel text="SwitchBot" count={switchbotDevices.length} />
              <div className="space-y-2">
                {switchbotDevices.map(d => (
                  <SwitchBotCard key={d.id} device={d} sendCommand={sendCommand} />
                ))}
                {switchbotDevices.length === 0 && (
                  <p className="text-[11px] text-[#A8A69F] font-mono">Connecting...</p>
                )}
              </div>
            </div>

            {/* Nature Remo */}
            <div className="fade-up d-240">
              <SectionLabel text="Nature Remo" count={natureRemoDevices.length} />
              <div className="space-y-2">
                {natureRemoDevices.map(d => (
                  <NatureRemoCard key={d.id} device={d} sendCommand={sendCommand} />
                ))}
                {natureRemoDevices.length === 0 && (
                  <p className="text-[11px] text-[#A8A69F] font-mono">Connecting...</p>
                )}
              </div>
            </div>

            {/* Roomba iRobot */}
            <div className="fade-up d-320">
              <SectionLabel text="iRobot Roomba" count={roombaDevices.length} />
              <div className="space-y-2">
                {roombaDevices.map(d => (
                  <RoombaCard key={d.id} device={d} sendCommand={sendCommand} />
                ))}
                {roombaDevices.length === 0 && (
                  <p className="text-[11px] text-[#A8A69F] font-mono">Connecting...</p>
                )}
              </div>
            </div>
          </div>

          {/* 3D Digital Twin */}
          <div className="fade-up d-80 col-start-2 col-span-2 relative bg-[#ECEAE3] rounded-3xl overflow-hidden" style={{ minHeight: '520px' }}>
            {/* Label badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-surface/80 backdrop-blur-sm border border-[#E5E3DC] rounded-xl px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8361E] pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6860]">3D Digital Twin</span>
            </div>

            {/* Interactive badge */}
            <div className="absolute top-4 right-4 z-10 bg-[#8e8e8e]/10 text-[#FFFAFA] border border-[#000000]/20 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              Interactive
            </div>

            {/* 3D scene */}
            <div className="w-full h-full absolute inset-0">
              <DigitalTwin devices={devices} sendCommand={sendCommand} />
            </div>
          </div>

          <div className="fade-up d-240 col-start-2 bg-surface rounded-2xl border border-[#E5E3DC] overflow-hidden" style={{ animationDelay: '240ms' }}>
            <div className="px-4 py-3 border-b border-[#E5E3DC] flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#6B6860] uppercase tracking-wider">CCTV Camera</span>
              <ArrowSquareOut className="w-3.5 h-3.5 text-[#A8A69F]" />
            </div>
            <div>
              <CCTVViewer devices={devices} />
            </div>
          </div>

          {/* System Status Panel */}
          <div className="fade-up d-240 col-start-3 h-full" style={{ animationDelay: '240ms' }}>
            <SystemPanel connected={connected} onlineCount={onlineCount} total={devices.length} />
          </div>
        </div>

      </div>
    </div>
  );
}
