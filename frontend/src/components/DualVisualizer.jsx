import { useRef, useEffect } from 'react';

export const DualVisualizer = ({ deckAData, deckBData, isPlayingA, isPlayingB, crossfade }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Mix visualizer data based on crossfade
  const mixData = (dataA, dataB, crossfade) => {
    const mixed = new Uint8Array(dataA.length);
    const deckAVol = crossfade <= 0 ? 1 : 1 - crossfade;
    const deckBVol = crossfade >= 0 ? 1 : 1 + crossfade;
    
    for (let i = 0; i < dataA.length; i++) {
      mixed[i] = Math.floor(dataA[i] * deckAVol + dataB[i] * deckBVol);
    }
    return mixed;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
      ctx.fillRect(0, 0, width, height);

      const isPlaying = isPlayingA || isPlayingB;
      
      if (!isPlaying) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // Mix the data from both decks
      const mixedData = mixData(deckAData, deckBData, crossfade);
      const barCount = 64;
      const barWidth = (width / barCount) - 2;
      const barGap = 2;

      // Draw spectrum bars
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * (mixedData.length / barCount));
        const value = mixedData[dataIndex] || 0;
        const barHeight = (value / 255) * height * 0.8;
        const x = i * (barWidth + barGap);
        const y = height - barHeight;

        // Color based on frequency range
        let color;
        if (i < barCount * 0.3) {
          color = '#FF003C'; // Bass - Magenta
        } else if (i < barCount * 0.6) {
          color = '#00F0FF'; // Mid - Cyan
        } else {
          color = '#39FF14'; // High - Lime
        }

        const gradient = ctx.createLinearGradient(x, y + barHeight, x, y);
        gradient.addColorStop(0, color + '33');
        gradient.addColorStop(0.5, color + 'CC');
        gradient.addColorStop(1, color);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        if (value > 200) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 15;
          ctx.fillRect(x, y, barWidth, barHeight);
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y - 4, barWidth, 2);
      }

      // Draw waveform preview for both decks
      if (isPlayingA) {
        drawWaveform(ctx, deckAData, width, height * 0.15, '#00F0FF', 0.5);
      }
      if (isPlayingB) {
        drawWaveform(ctx, deckBData, width, height * 0.15, '#FF003C', 0.7);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    const drawWaveform = (ctx, data, width, yPos, color, alpha) => {
      const alphaHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.strokeStyle = color + alphaHex;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const sliceWidth = width / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * 30) + yPos;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.stroke();
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [deckAData, deckBData, isPlayingA, isPlayingB, crossfade]);

  return (
    <div 
      className="relative cyber-panel p-2 overflow-hidden"
      data-testid="dual-visualizer-container"
    >
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />
      
      <canvas
        ref={canvasRef}
        width={800}
        height={180}
        className="w-full h-[140px] md:h-[180px] rounded"
        data-testid="dual-visualizer-canvas"
      />

      {/* Deck indicators */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <span className={`text-[10px] font-mono flex items-center gap-1 ${isPlayingA ? 'text-[#00F0FF]' : 'text-white/30'}`}>
          <span className={`w-2 h-2 rounded-full ${isPlayingA ? 'bg-[#00F0FF] animate-pulse' : 'bg-white/20'}`} />
          DECK A
        </span>
        <span className={`text-[10px] font-mono flex items-center gap-1 ${isPlayingB ? 'text-[#FF003C]' : 'text-white/30'}`}>
          <span className={`w-2 h-2 rounded-full ${isPlayingB ? 'bg-[#FF003C] animate-pulse' : 'bg-white/20'}`} />
          DECK B
        </span>
      </div>

      <div className="absolute bottom-4 left-4 flex gap-4 text-[10px] font-mono text-white/50">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#FF003C] rounded-full" />
          BASS
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#00F0FF] rounded-full" />
          MID
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#39FF14] rounded-full" />
          HIGH
        </span>
      </div>

      <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
    </div>
  );
};

export default DualVisualizer;
