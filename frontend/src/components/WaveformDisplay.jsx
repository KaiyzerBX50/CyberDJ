import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const WaveformDisplay = ({ 
  waveformData, 
  analyserData,
  isPlaying, 
  deckId = 'A',
  bpm = 128,
  currentTime = 0,
  duration = 0,
  trackName = 'NO TRACK'
}) => {
  const canvasRef = useRef(null);
  const deckColor = deckId === 'A' ? '#FF8800' : '#00AAFF'; // Orange for A, Blue for B like Pioneer

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear with dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    
    // Vertical beat grid lines
    const beatWidth = width / 16;
    for (let i = 0; i <= 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * beatWidth, 0);
      ctx.lineTo(i * beatWidth, height);
      ctx.strokeStyle = i % 4 === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)';
      ctx.stroke();
    }
    
    // Center line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    if (waveformData.length > 0 && isPlaying) {
      // Draw waveform
      const barWidth = width / waveformData.length;
      
      for (let i = 0; i < waveformData.length; i++) {
        const value = (waveformData[i] - 128) / 128;
        const barHeight = Math.abs(value) * height * 0.4;
        const x = i * barWidth;
        const y = height / 2;
        
        // Color based on frequency
        const freqIndex = Math.floor(i / waveformData.length * analyserData.length);
        const freqValue = analyserData[freqIndex] || 128;
        
        // Gradient from deck color
        const alpha = 0.5 + (freqValue / 255) * 0.5;
        ctx.fillStyle = deckColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        
        // Draw bar (mirrored)
        ctx.fillRect(x, y - barHeight, barWidth - 1, barHeight);
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      }
      
      // Glow effect
      ctx.shadowColor = deckColor;
      ctx.shadowBlur = 10;
    }
    
    // Playhead
    const playheadX = width / 2;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
    
  }, [waveformData, analyserData, isPlaying, deckColor]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="rounded-lg overflow-hidden border border-white/10"
      style={{ background: '#0a0a0a' }}
      data-testid={`waveform-display-${deckId.toLowerCase()}`}
    >
      {/* Info bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/50 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span 
            className="text-[10px] font-['Orbitron'] font-bold"
            style={{ color: deckColor }}
          >
            {deckId}
          </span>
          <span className="text-[10px] font-mono text-white/60 truncate max-w-[150px]">
            {trackName}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-white/80">
            {formatTime(currentTime)}
          </span>
          <div className="px-2 py-0.5 rounded bg-black/50 border border-white/20">
            <span 
              className="text-lg font-['Orbitron'] font-bold"
              style={{ color: deckColor }}
            >
              {bpm}
            </span>
            <span className="text-[8px] text-white/40 ml-1">BPM</span>
          </div>
        </div>
      </div>
      
      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        width={600}
        height={80}
        className="w-full h-[80px]"
      />
      
      {/* Beat markers */}
      <div className="flex h-2 bg-black/30">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="flex-1 border-r border-white/10"
            style={{
              background: i % 4 === 0 
                ? `${deckColor}40` 
                : i % 2 === 0 
                  ? `${deckColor}20` 
                  : 'transparent'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WaveformDisplay;
