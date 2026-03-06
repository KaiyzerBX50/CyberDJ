import { motion } from 'framer-motion';

export const VerticalVUMeter = ({ analyserData, isPlaying, deckId = 'A' }) => {
  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';
  
  // Calculate level from analyser data
  const level = isPlaying && analyserData.length > 0
    ? analyserData.reduce((a, b) => a + b, 0) / analyserData.length / 255
    : 0;

  const segmentCount = 16;
  const segments = Array.from({ length: segmentCount }, (_, i) => {
    const threshold = (i + 1) / segmentCount;
    const isActive = level >= threshold;
    
    // Color zones: green (0-60%), yellow (60-80%), red (80-100%)
    let color;
    if (i < segmentCount * 0.6) {
      color = isActive ? '#39FF14' : '#1a3d1a';
    } else if (i < segmentCount * 0.8) {
      color = isActive ? '#FFD700' : '#3d3d1a';
    } else {
      color = isActive ? '#FF003C' : '#3d1a1a';
    }
    
    return { isActive, color };
  });

  return (
    <div 
      className="flex flex-col items-center gap-1"
      data-testid={`vu-meter-vertical-${deckId.toLowerCase()}`}
    >
      {/* VU meter column */}
      <div className="flex flex-col-reverse gap-0.5 p-1 rounded bg-black/50 border border-white/10">
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            className="w-3 h-1.5 rounded-sm"
            style={{
              background: seg.color,
              boxShadow: seg.isActive ? `0 0 4px ${seg.color}` : 'none',
            }}
            animate={{ opacity: seg.isActive ? 1 : 0.3 }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </div>
      
      {/* Peak indicator */}
      <div 
        className="text-[8px] font-mono"
        style={{ color: level > 0.8 ? '#FF003C' : '#39FF14' }}
      >
        {level > 0 ? Math.round(level * 100) : '--'}
      </div>
    </div>
  );
};

export default VerticalVUMeter;
