import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

export const Knob = ({ 
  label, 
  value = 0.5, 
  onChange, 
  min = 0, 
  max = 1, 
  size = 60,
  color = '#00F0FF',
  testId
}) => {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(value);

  // Convert value to rotation (0-270 degrees)
  const normalizedValue = (value - min) / (max - min);
  const rotation = normalizedValue * 270 - 135; // -135 to 135 degrees

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  }, [value]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;
    const sensitivity = 0.005;
    const range = max - min;
    const newValue = Math.max(min, Math.min(max, startValue + deltaY * sensitivity * range));
    
    onChange?.(newValue);
  }, [isDragging, startY, startValue, min, max, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch support
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setStartY(touch.clientY);
    setStartValue(value);
  }, [value]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaY = startY - touch.clientY;
    const sensitivity = 0.005;
    const range = max - min;
    const newValue = Math.max(min, Math.min(max, startValue + deltaY * sensitivity * range));
    onChange?.(newValue);
  }, [isDragging, startY, startValue, min, max, onChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Generate tick marks
  const tickCount = 11;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / (tickCount - 1)) * 270 - 135;
    const isActive = i / (tickCount - 1) <= normalizedValue;
    return { angle, isActive };
  });

  return (
    <div 
      className="flex flex-col items-center gap-2 select-none"
      data-testid={testId}
    >
      {/* Label */}
      <span className="text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase">
        {label}
      </span>

      {/* Knob container */}
      <div 
        className="relative cursor-ns-resize"
        style={{ width: size, height: size }}
        ref={knobRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 h-2"
            style={{
              transform: `rotate(${tick.angle}deg) translateY(-${size / 2 + 5}px)`,
              transformOrigin: 'center',
              background: tick.isActive ? color : 'rgba(255,255,255,0.2)',
              boxShadow: tick.isActive ? `0 0 4px ${color}` : 'none',
              transition: 'all 0.1s ease',
            }}
          />
        ))}

        {/* Outer ring (glow indicator) */}
        <svg 
          className="absolute inset-0"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 4}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 4}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={`${normalizedValue * Math.PI * (size - 8)} ${Math.PI * (size - 8)}`}
            strokeLinecap="round"
            transform={`rotate(-225, ${size / 2}, ${size / 2})`}
            style={{
              filter: `drop-shadow(0 0 4px ${color})`,
              transition: 'stroke-dasharray 0.1s ease',
            }}
          />
        </svg>

        {/* Knob body */}
        <motion.div
          className="absolute inset-[8px] rounded-full"
          style={{
            background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
            boxShadow: `
              inset 2px 2px 5px rgba(0,0,0,0.5),
              inset -2px -2px 5px rgba(255,255,255,0.05),
              ${isDragging ? `0 0 15px ${color}40` : '0 2px 10px rgba(0,0,0,0.5)'}
            `,
            rotate: rotation,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Indicator line */}
          <div 
            className="absolute top-2 left-1/2 w-0.5 h-3 -translate-x-1/2 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 6px ${color}`,
            }}
          />

          {/* Center dot */}
          <div 
            className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'linear-gradient(145deg, #333, #222)',
            }}
          />
        </motion.div>
      </div>

      {/* Value display */}
      <span 
        className="text-xs font-mono"
        style={{ color }}
      >
        {Math.round(normalizedValue * 100)}%
      </span>
    </div>
  );
};

export default Knob;
