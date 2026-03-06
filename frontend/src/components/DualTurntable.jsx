import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const DualTurntable = ({ isPlaying, analyserData, currentStation, deckId = 'A', isActive = false }) => {
  const [rotation, setRotation] = useState(0);
  const [tonearmAngle, setTonearmAngle] = useState(-30);
  const rotationRef = useRef(0);
  const animationRef = useRef(null);

  // Calculate average bass frequencies for reactive effects
  const bassLevel = analyserData.slice(0, 8).reduce((a, b) => a + b, 0) / 8 / 255;

  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      if (isPlaying) {
        const speed = 198 * (1 + bassLevel * 0.05);
        rotationRef.current = (rotationRef.current + speed * deltaTime) % 360;
        setRotation(rotationRef.current);
        setTonearmAngle(-5 + Math.sin(currentTime / 1000) * 2);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, bassLevel]);

  useEffect(() => {
    setTonearmAngle(isPlaying ? -5 : -30);
  }, [isPlaying]);

  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';

  return (
    <div 
      className={`relative transition-all duration-300 ${isActive ? 'scale-105' : 'scale-100 opacity-80'}`}
      data-testid={`turntable-deck-${deckId.toLowerCase()}`}
    >
      {/* Deck label */}
      <div 
        className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-['Orbitron'] font-bold tracking-widest"
        style={{ 
          backgroundColor: `${deckColor}20`,
          border: `1px solid ${deckColor}`,
          color: deckColor,
          boxShadow: isActive ? `0 0 20px ${deckColor}40` : 'none'
        }}
      >
        DECK {deckId}
      </div>

      {/* Turntable base */}
      <div className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] mx-auto">
        {/* Platter base */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
            boxShadow: `inset 0 2px 10px rgba(0,0,0,0.8), 0 0 ${isActive ? 30 : 10}px ${deckColor}20`,
            border: `3px solid ${isActive ? deckColor + '40' : '#222'}`,
            transition: 'all 0.3s ease',
          }}
        />
        
        {/* Platter ring */}
        <div 
          className="absolute inset-[6px] rounded-full"
          style={{
            background: 'linear-gradient(to bottom, #333, #111)',
          }}
        />

        {/* Vinyl record */}
        <motion.div
          className="absolute inset-[12px] md:inset-[15px] rounded-full"
          style={{
            rotate: rotation,
            boxShadow: `0 0 ${15 + bassLevel * 25}px ${deckColor}${Math.floor((0.1 + bassLevel * 0.2) * 255).toString(16).padStart(2, '0')}`,
          }}
        >
          {/* Vinyl grooves */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from ${rotation}deg, 
                #0a0a0a, #1a1a1a, #0a0a0a, #151515, 
                #0a0a0a, #1a1a1a, #0a0a0a, #151515,
                #0a0a0a, #1a1a1a, #0a0a0a, #151515,
                #0a0a0a, #1a1a1a, #0a0a0a, #151515
              )`,
            }}
          />
          
          {/* Groove rings */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/5"
              style={{ inset: `${12 + i * 10}%` }}
            />
          ))}

          {/* Center label */}
          <div 
            className="absolute inset-[28%] md:inset-[30%] rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: deckId === 'A' 
                ? 'linear-gradient(135deg, #00F0FF 0%, #0066FF 100%)'
                : 'linear-gradient(135deg, #FF003C 0%, #FF6600 100%)',
            }}
          >
            <div className="text-center p-1">
              <div className="text-[6px] md:text-[9px] font-bold text-white uppercase tracking-widest font-['Rajdhani']">
                {currentStation?.name?.substring(0, 10) || `DECK ${deckId}`}
              </div>
              <div className="text-[5px] md:text-[7px] text-white/70 uppercase">
                {isPlaying ? 'LIVE' : 'READY'}
              </div>
            </div>
            <div className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full bg-black" />
          </div>
        </motion.div>

        {/* Tonearm */}
        <motion.div
          className="absolute -right-[15px] md:-right-[20px] top-[18%] origin-top-right"
          style={{ rotate: tonearmAngle }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <div 
            className="absolute -top-3 -right-3 w-8 h-8 md:w-10 md:h-10 rounded-full"
            style={{
              background: 'linear-gradient(145deg, #333, #1a1a1a)',
            }}
          />
          <div 
            className="w-[100px] md:w-[130px] h-1.5 rounded-full"
            style={{
              background: 'linear-gradient(to bottom, #555, #333)',
            }}
          />
          <div 
            className="absolute left-0 top-0 w-6 h-3 -translate-x-4 translate-y-[-3px]"
            style={{
              background: 'linear-gradient(to bottom, #444, #222)',
              clipPath: 'polygon(100% 0, 100% 100%, 0 80%, 0 20%)',
            }}
          >
            <div 
              className={`absolute bottom-0 left-1 w-1 h-1 rounded-full ${isPlaying ? 'led-on' : 'led-off'}`}
              style={{ background: isPlaying ? deckColor : '#333' }}
            />
          </div>
        </motion.div>

        {/* Status LEDs */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-75"
              style={{
                background: isPlaying && analyserData[i * 12] > 100 ? deckColor : '#333',
                boxShadow: isPlaying && analyserData[i * 12] > 100 ? `0 0 6px ${deckColor}` : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DualTurntable;
