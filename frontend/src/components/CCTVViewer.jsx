// frontend/src/components/CCTVViewer.jsx
import React, { useState } from 'react';
import { VideoCamera } from '@phosphor-icons/react';

function CameraTile({ cam }) {
  const [videoError, setVideoError] = useState(false);
  const isStreaming = cam.status === 'streaming';
  const streamUrl = cam.properties?.stream_url;
  const showVideo = isStreaming && streamUrl && !videoError;

  return (
    <div className="relative aspect-video min-h-[180px] bg-[#1C1B18] overflow-hidden group">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#1C1B18]">
        <VideoCamera className="w-6 h-6 text-white/35" weight="bold" />
        <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider">
          {showVideo ? 'Loading Feed' : videoError ? 'Feed Unavailable' : 'Feed Offline'}
        </span>
      </div>

      {showVideo && (
        <video
          src={streamUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.9] contrast-[1.05]"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

      <div className="absolute bottom-2.5 left-2.5 z-10">
        <p className="text-[11px] font-semibold text-white leading-tight drop-shadow-sm">
          {cam.name}
        </p>
        <p className="text-[9px] font-mono text-white/70 mt-0.5">
          {cam.properties?.resolution} · {cam.properties?.fps} FPS
        </p>
      </div>

      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
        <span className={`w-1.5 h-1.5 rounded-full ${showVideo ? 'bg-[#E8361E] pulse' : 'bg-[#A8A69F]'}`} />
        <span className="text-[8px] font-mono font-bold text-white uppercase tracking-widest">
          {showVideo ? 'REC' : 'OFF'}
        </span>
      </div>
    </div>
  );
}

export function CCTVViewer({ devices }) {
  const cctvDevices = devices.filter((d) => d.type === 'cctv');

  return (
    <div className="w-full grid grid-cols-2 gap-px bg-[#E5E3DC]">
      {cctvDevices.length > 0 ? (
        cctvDevices.map((cam) => <CameraTile key={cam.id} cam={cam} />)
      ) : (
        <div className="col-span-2 min-h-[220px] flex flex-col items-center justify-center text-light-gray text-xs font-mono p-8 bg-[#FAF9F6]">
          <VideoCamera className="w-6 h-6 text-[#D4D1C8] mb-1" />
          No CCTV Configured
        </div>
      )}
    </div>
  );
}
