import { useMemo } from 'react';
import { motion } from 'framer-motion';

export const VUMeter = ({ analyserData, isPlaying, label = 'L' }) => {
  // Calculate level from analyser data
  const level = useMemo(() => {
    if (!isPlaying || !analyserData.length) return 0;
    const sum = analyserData.reduce((a, b) => a + b, 0);
    return sum / analyserData.length / 255;
  }, [analyserData, isPlaying]);

  const ledCount = 12;
  const leds = Array.from({ length: ledCount }, (_, i) => {
    const threshold = (i + 1) / ledCount;
    const isActive = level >= threshold;
    
    // Color zones: green (0-60%), yellow (60-80%), red (80-100%)
    let color;
    if (i < ledCount * 0.6) {
      color = isActive ? '#39FF14' : '#1a4d1a';
    } else if (i < ledCount * 0.8) {
      color = isActive ? '#FFD700' : '#4d4d1a';
    } else {
      color = isActive ? '#FF003C' : '#4d1a1a';
    }
    
    return { isActive, color };
  });

  return (
    <div className="flex flex-col items-center gap-1" data-testid={`vu-meter-${label.toLowerCase()}`}>
      {/* VU Meter bars */}
      <div className="flex flex-col-reverse gap-0.5">
        {leds.map((led, i) => (
          <motion.div
            key={i}
            className="w-6 h-2 rounded-sm"
            style={{
              background: led.color,
              boxShadow: led.isActive ? `0 0 8px ${led.color}` : 'none',
            }}
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: led.isActive ? 1 : 0.3,
            }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </div>
      
      {/* Scale markers */}
      <div className="flex justify-between w-6 text-[8px] font-mono text-white/40">
        <span>-</span>
        <span>+</span>
      </div>
      
      {/* Label */}
      <span className="text-[10px] font-mono tracking-wider text-white/60">
        {label}
      </span>
    </div>
  );
};

export default VUMeter;
