// dependencies
import React, { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, useProgress, Html } from '@react-three/drei';
import { Cube, Crosshair } from '@phosphor-icons/react';
import * as THREE from 'three';

// camera configuration 
const CAMERA_POSITION = [47.06, -50.74, 19.05];   
const CAMERA_TARGET = [47.06, 25, 19.05];  
const CAMERA_FOV = 100;                      

const Model = React.memo(function Model({ onCoordSelect }) {
  console.log('[Model] Loading GLB model with original textures...');
  const { scene } = useGLTF('/models/Hospital-Room-2-opt.glb?v=2');

  return (
    <primitive 
      object={scene} 
      dispose={null} 
      onPointerDown={(e) => {
        e.stopPropagation()
        const point = e.point;
        console.log(`[Coordinate Picker] Clicked Position: [${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}]`);
        onCoordSelect(point);
      }}
    />
  );
}, () => true); 

// camera controller component to sync camera position and target with props
function CameraController({ position, target, fov, controlsRef }) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(...position);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    
    if (controlsRef.current) {
      controlsRef.current.target.set(...target);
      controlsRef.current.update();
    } else {
      camera.lookAt(...target);
    }
    console.log('[CameraController] Camera synced: position =', position, 'target =', target);
  }, [position, target, fov, camera, controlsRef]);

  return null;
}

// loading overlay component 
function LoadingOverlay() {
  const { active, progress } = useProgress();
  if (!active) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#F2F1ED] z-10">
      <Cube className="w-8 h-8 text-[#E8361E] animate-bounce" weight="thin" />
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-mono text-[#6B6860] font-semibold">Loading 3D Ward</span>
        <span className="text-[10px] font-mono text-[#A8A69F]">{Math.round(progress)}% loaded</span>
      </div>
      <div className="w-32 h-1 bg-[#E5E3DC] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#E8361E] transition-all duration-150" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}


// hotspot component for interactive device controls
function Hotspot({ id, label, value, status, properties, position, isFocused, onToggleFocus, sendCommand }) {
  const isActive = status === 'on' || status === 'active' || status === 'locked' || status === 'cleaning' || status === 'pressing';
  
  let dotColor = 'bg-[#A8A69F]'; 
  if (status === 'on' || status === 'active') dotColor = 'bg-[#2D7B35]'; 
  if (status === 'locked') dotColor = 'bg-[#E8361E]';                  
  if (status === 'cleaning' || status === 'pressing') dotColor = 'bg-amber-500'; 

  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Html position={position} center style={{ zIndex: isFocused ? 9999 : 1 }}>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onToggleFocus();
        }}
        onPointerDown={handleContainerClick}
        className={`flex items-center gap-2.5 bg-white/95 backdrop-blur-sm border ${isActive ? 'border-[#E8361E]/30 shadow-md shadow-[#E8361E]/5' : 'border-[#E5E3DC] shadow-sm'} px-4 py-2.5 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 select-none pointer-events-auto group min-w-[120px]`}
      >
        {/* Status dot */}
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor} ${isActive ? 'animate-pulse' : ''}`} />
        
        <div className="flex flex-col">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#A8A69F] group-hover:text-[#E8361E] transition-colors whitespace-nowrap">
            {label}
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1C1B18] -mt-0.5 whitespace-nowrap">
            {value}
          </span>
        </div>

        {/* Floating Context Control Popover */}
        {isFocused && (
          <div 
            onClick={handleContainerClick}
            onPointerDown={handleContainerClick}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white/98 backdrop-blur-md border border-[#E5E3DC] rounded-2xl p-4 shadow-xl pointer-events-auto min-w-[220px] z-50 flex flex-col gap-3.5 text-left"
          >
            <div className="flex items-center justify-between border-b border-[#E5E3DC] pb-1.5">
              <span className="text-[10px] font-mono font-bold text-[#1C1B18] uppercase tracking-wider">{label} Controls</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFocus();
                }}
                className="text-xs text-[#A8A69F] hover:text-[#E8361E] font-bold font-mono px-1"
              >
                ✕
              </button>
            </div>

            {/* Dynamic Controls based on Device ID */}
            {id === 'switchbot-lamp-01' && (
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => sendCommand(id, status === 'on' ? 'turn_off' : 'turn_on')}
                  className={`w-full py-1.5 rounded-xl text-xs font-mono font-bold uppercase border transition-all duration-150 ${status === 'on' ? 'bg-[#2D7B35] text-white border-[#2D7B35]' : 'bg-transparent text-[#6B6860] border-[#E5E3DC] hover:border-[#E8361E]'}`}
                >
                  Power: {status.toUpperCase()}
                </button>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] font-mono text-[#A8A69F]">
                    <span>BRIGHTNESS</span>
                    <span>{properties.brightness || 70}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={properties.brightness || 70}
                    onChange={(e) => sendCommand(id, 'set_brightness', { brightness: parseInt(e.target.value) })}
                    className="w-full accent-[#E8361E] h-1 bg-[#E5E3DC] rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {id === 'nature-remo-ac-01' && (
              <div className="flex flex-col gap-3">
                {/* AC Power Toggle */}
                <button
                  onClick={() => sendCommand(id, status === 'on' ? 'turn_off' : 'turn_on')}
                  className={`w-full py-1.5 rounded-xl text-xs font-mono font-bold uppercase border transition-all duration-150 ${status === 'on' ? 'bg-[#2D7B35] text-white border-[#2D7B35]' : 'bg-transparent text-[#6B6860] border-[#E5E3DC] hover:border-[#E8361E]'}`}
                >
                  Power: {status.toUpperCase()}
                </button>
                
                {status === 'on' && (
                  <>
                    {/* AC Temperature Selector */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-[#A8A69F]">TEMPERATURE</span>
                      <div className="flex items-center justify-between border border-[#E5E3DC] rounded-xl px-2 py-1">
                        <button
                          onClick={() => sendCommand(id, 'set_temperature', { temperature: Math.max(16, (properties.temperature || 22) - 1) })}
                          className="w-6 h-6 rounded-lg bg-[#FAF9F6] border border-[#E5E3DC] text-xs font-bold font-mono flex items-center justify-center hover:border-[#E8361E]"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold text-[#1C1B18]">{properties.temperature || 22}°C</span>
                        <button
                          onClick={() => sendCommand(id, 'set_temperature', { temperature: Math.min(30, (properties.temperature || 22) + 1) })}
                          className="w-6 h-6 rounded-lg bg-[#FAF9F6] border border-[#E5E3DC] text-xs font-bold font-mono flex items-center justify-center hover:border-[#E8361E]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* AC Mode Selector */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-[#A8A69F]">AC MODE</span>
                      <div className="grid grid-cols-4 gap-1">
                        {['cool', 'heat', 'dry', 'fan'].map((m) => (
                          <button
                            key={m}
                            onClick={() => sendCommand(id, 'set_mode', { mode: m })}
                            className={`py-1 rounded-lg text-[9px] font-mono font-bold uppercase border transition-all duration-150 ${properties.mode === m ? 'bg-[#E8361E] text-white border-[#E8361E]' : 'bg-[#FAF9F6] text-[#6B6860] border-[#E5E3DC] hover:border-[#E8361E]'}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AC Fan Speed Selector */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-[#A8A69F]">FAN SPEED</span>
                      <div className="grid grid-cols-4 gap-1">
                        {['auto', 'low', 'medium', 'high'].map((f) => (
                          <button
                            key={f}
                            onClick={() => sendCommand(id, 'set_fan_speed', { fan_speed: f })}
                            className={`py-1 rounded-lg text-[8px] font-mono font-bold uppercase border transition-all duration-150 ${properties.fan_speed === f ? 'bg-[#1C1B18] text-white border-[#1C1B18]' : 'bg-[#FAF9F6] text-[#6B6860] border-[#E5E3DC] hover:border-[#E8361E]'}`}
                          >
                            {f === 'medium' ? 'med' : f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {id === 'nature-remo-tv-01' && (
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => sendCommand(id, status === 'on' ? 'turn_off' : 'turn_on')}
                  className={`w-full py-1.5 rounded-xl text-xs font-mono font-bold uppercase border transition-all duration-150 ${status === 'on' ? 'bg-[#2D7B35] text-white border-[#2D7B35]' : 'bg-transparent text-[#6B6860] border-[#E5E3DC] hover:border-[#E8361E]'}`}
                >
                  Power: {status.toUpperCase()}
                </button>
                {status === 'on' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[9px] font-mono text-[#A8A69F]">
                        <span>VOLUME</span>
                        <span>{properties.volume || 15}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={properties.volume || 15}
                        onChange={(e) => sendCommand(id, 'set_volume', { volume: parseInt(e.target.value) })}
                        className="w-full accent-[#E8361E] h-1 bg-[#E5E3DC] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-[#A8A69F]">CHANNEL</span>
                      <div className="flex items-center justify-between border border-[#E5E3DC] rounded-xl px-2 py-1">
                        <button
                          onClick={() => sendCommand(id, 'set_channel', { channel: Math.max(1, (properties.channel || 1) - 1) })}
                          className="w-6 h-6 rounded-lg bg-[#FAF9F6] border border-[#E5E3DC] text-xs font-bold font-mono flex items-center justify-center hover:border-[#E8361E]"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold text-[#1C1B18]">CH {properties.channel || 1}</span>
                        <button
                          onClick={() => sendCommand(id, 'set_channel', { channel: (properties.channel || 1) + 1 })}
                          className="w-6 h-6 rounded-lg bg-[#FAF9F6] border border-[#E5E3DC] text-xs font-bold font-mono flex items-center justify-center hover:border-[#E8361E]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {id === 'switchbot-bot-01' && (
              <button
                disabled={status === 'pressing'}
                onClick={() => sendCommand(id, 'press')}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase border transition-all duration-150 ${status === 'pressing' ? 'bg-amber-500 text-white border-amber-500 animate-pulse' : 'bg-[#E8361E] text-white border-[#E8361E] hover:bg-[#c92f1a]'}`}
              >
                {status === 'pressing' ? 'CALLING...' : 'EMERGENCY CALL'}
              </button>
            )}

            {id === 'switchbot-lock-01' && (
              <button
                onClick={() => sendCommand(id, status === 'locked' ? 'unlock' : 'lock')}
                className={`w-full py-1.5 rounded-xl text-xs font-mono font-bold uppercase border transition-all duration-150 ${status === 'locked' ? 'bg-[#E8361E] text-white border-[#E8361E]' : 'bg-transparent text-[#6B6860] border-[#E5E3DC] hover:border-[#E8361E]'}`}
              >
                Action: {status === 'locked' ? 'UNLOCK' : 'LOCK'}
              </button>
            )}

            {id === 'roomba-01' && (
              <div className="flex gap-2">
                <button
                  onClick={() => sendCommand(id, 'clean')}
                  disabled={status === 'cleaning'}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase border transition-all duration-150 ${status === 'cleaning' ? 'bg-[#2D7B35] text-white border-[#2D7B35]' : 'bg-transparent text-[#6B6860] border-[#E5E3DC] hover:border-[#E8361E]'}`}
                >
                  Clean
                </button>
                <button
                  onClick={() => sendCommand(id, 'dock')}
                  disabled={status !== 'cleaning'}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase border transition-all duration-150 ${status !== 'cleaning' ? 'bg-[#A8A69F] text-white border-[#A8A69F]' : 'bg-transparent text-[#6B6860] border-[#E5E3DC] hover:border-[#E8361E]'}`}
                >
                  Dock
                </button>
              </div>
            )}

            {id === 'switchbot-humidity-01' && (
              <div className="flex flex-col gap-1.5 text-xs font-mono text-[#6B6860]">
                <div className="flex justify-between">
                  <span>TEMP:</span>
                  <span className="font-bold text-[#1C1B18]">{properties.temperature || 23.5}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>HUMIDITY:</span>
                  <span className="font-bold text-[#1C1B18]">{properties.humidity || 55.4}%</span>
                </div>
                <div className="text-[9px] text-[#A8A69F] text-center mt-1 border-t border-[#E5E3DC] pt-1">
                  READ-ONLY SENSOR
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Html>
  );
}


// main digital twin component
export function DigitalTwin({ devices, sendCommand }) {
  console.log(`[DigitalTwin] rendering (device count: ${devices.length})`);
  const controlsRef = useRef();
  
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [activeControlId, setActiveControlId] = useState(null);

  const getDevice = useCallback((id) => {
    return devices.find(d => d.id === id) || { status: 'off', properties: {} };
  }, [devices]);

  const handleHotspotClick = useCallback((id, command, params = null) => {
    console.log(`[3D Control] Sending: ${command} to ${id}`, params);
    sendCommand(id, command, params);
  }, [sendCommand]);

  const handleCoordSelect = useCallback((point) => {
    setSelectedCoords([
      parseFloat(point.x.toFixed(2)),
      parseFloat(point.y.toFixed(2)),
      parseFloat(point.z.toFixed(2))
    ]);
  }, []);

  const hotspots = [
    {
      id: 'switchbot-lamp-01',
      label: 'Bed Light',
      position: [122.25, -20.69, -13.44],
      getValue: (dev) => dev.status === 'on' ? `ON (${dev.properties.brightness || 70}%)` : 'OFF'
    },
    {
      id: 'switchbot-bot-01',
      label: 'Nurse Call',
      position: [129.87, -4.69, 0.68],
      getValue: (dev) => dev.status === 'pressing' ? 'CALLING' : 'IDLE'
    },
    {
      id: 'switchbot-humidity-01',
      label: 'Humid & Temp',
      position: [52.22, 13.27, -66.45],
      getValue: (dev) => `${dev.properties.temperature || 23.5}°C`
    },
    {
      id: 'switchbot-lock-01',
      label: 'Door Lock',
      position: [98.72, -9.54, 111.18],
      getValue: (dev) => dev.status === 'locked' ? 'LOCKED' : 'UNLOCKED'
    },
    {
      id: 'nature-remo-ac-01',
      label: 'Air Conditioner',
      position: [122.35, 35, -36.3],
      getValue: (dev) => dev.status === 'on' ? `ON (${dev.properties.temperature || 22}°C)` : 'OFF'
    },
    {
      id: 'nature-remo-tv-01',
      label: 'Ward TV',
      position: [-16.09, 6.57, 21.46],
      getValue: (dev) => dev.status === 'on' ? 'PLAYING' : 'OFF'
    },
    {
      id: 'roomba-01',
      label: 'Cleaner Robot',
      position: [40.07, -42.96, 95.85],
      getValue: (dev) => dev.status === 'cleaning' ? 'CLEANING' : 'DOCKED'
    }
  ];

  return (
    <div className="w-full h-full relative bg-[#F2F1ED]" style={{ minHeight: '400px' }}>
      
      <LoadingOverlay />
      <Canvas
        camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV, near: 0.1, far: 1000 }}
        style={{ background: '#F2F1ED' }}
        onPointerDown={() => setActiveControlId(null)} 
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[5, 12, 5]} intensity={1.2} />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />

        <CameraController 
          position={CAMERA_POSITION} 
          target={CAMERA_TARGET} 
          fov={CAMERA_FOV} 
          controlsRef={controlsRef} 
        />

        <Suspense fallback={null}>
          <Center>
            <Model onCoordSelect={handleCoordSelect} />
          </Center>
        </Suspense>

        {/* Render interactive hotspots with controls view*/}
        {hotspots.map((hotspot) => {
          const dev = getDevice(hotspot.id);
          return (
            <Hotspot
              key={hotspot.id}
              id={hotspot.id}
              label={hotspot.label}
              status={dev.status}
              properties={dev.properties || {}}
              value={hotspot.getValue(dev)}
              position={hotspot.position}
              isFocused={activeControlId === hotspot.id}
              onToggleFocus={() => setActiveControlId(activeControlId === hotspot.id ? null : hotspot.id)}
              sendCommand={handleHotspotClick}
            />
          );
        })}

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}