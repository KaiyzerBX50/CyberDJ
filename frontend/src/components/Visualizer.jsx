import { useRef, useEffect } from 'react';

export const Visualizer = ({ analyserData, waveformData, isPlaying }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      // Clear canvas with slight fade for trail effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
      ctx.fillRect(0, 0, width, height);

      if (!isPlaying) {
        // Draw idle state
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const barCount = 64;
      const barWidth = (width / barCount) - 2;
      const barGap = 2;

      // Draw spectrum bars
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * (analyserData.length / barCount));
        const value = analyserData[dataIndex] || 0;
        const barHeight = (value / 255) * height * 0.8;
        const x = i * (barWidth + barGap);
        const y = height - barHeight;

        // Gradient for bars based on frequency
        let hue;
        if (i < barCount * 0.3) {
          // Bass - Magenta
          hue = 348;
        } else if (i < barCount * 0.6) {
          // Mid - Cyan
          hue = 187;
        } else {
          // High - Lime
          hue = 120;
        }

        const saturation = 100;
        const lightness = 50 + (value / 255) * 20;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, y + barHeight, x, y);
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.3)`);
        gradient.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`);
        gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 1)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Glow effect for peaks
        if (value > 200) {
          ctx.shadowColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          ctx.shadowBlur = 15;
          ctx.fillRect(x, y, barWidth, barHeight);
          ctx.shadowBlur = 0;
        }

        // Peak dot
        ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
        ctx.fillRect(x, y - 4, barWidth, 2);
      }

      // Draw waveform (oscilloscope)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const sliceWidth = width / waveformData.length;
      let x = 0;

      for (let i = 0; i < waveformData.length; i++) {
        const v = waveformData[i] / 128.0;
        const y = (v * height) / 4 + height * 0.1;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Add glow to waveform
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserData, waveformData, isPlaying]);

  return (
    <div 
      className="relative cyber-panel p-2 overflow-hidden"
      data-testid="visualizer-container"
    >
      {/* Grid overlay */}
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
        height={200}
        className="w-full h-[150px] md:h-[200px] rounded"
        data-testid="visualizer-canvas"
      />

      {/* Labels */}
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

      {/* Scanlines effect */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
    </div>
  );
};

export default Visualizer;
