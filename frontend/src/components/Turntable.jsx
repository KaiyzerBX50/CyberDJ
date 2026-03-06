import { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

export const Turntable = ({ isPlaying, analyserData, currentStation }) => {
  const controls = useAnimation();
  const [rotation, setRotation] = useState(0);
  const [tonearmAngle, setTonearmAngle] = useState(-30);
  const rotationRef = useRef(0);
  const animationRef = useRef(null);

  // Calculate average bass frequencies for reactive effects
  const bassLevel = analyserData.slice(0, 8).reduce((a, b) => a + b, 0) / 8 / 255;
  const midLevel = analyserData.slice(8, 32).reduce((a, b) => a + b, 0) / 24 / 255;

  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      if (isPlaying) {
        // 33 RPM = 0.55 rotations per second = 198 degrees per second
        const speed = 198 * (1 + bassLevel * 0.05); // Slight speed variation with bass
        rotationRef.current = (rotationRef.current + speed * deltaTime) % 360;
        setRotation(rotationRef.current);
        setTonearmAngle(-5 + Math.sin(currentTime / 1000) * 2); // Subtle wobble
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

  // Tonearm animation
  useEffect(() => {
    if (isPlaying) {
      setTonearmAngle(-5);
    } else {
      setTonearmAngle(-30);
    }
  }, [isPlaying]);

  return (
    <div className="relative" data-testid="turntable-container">
      {/* Turntable base */}
      <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] mx-auto">
        {/* Platter base with metallic effect */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)',
            border: '4px solid #222',
          }}
        />
        
        {/* Platter ring */}
        <div 
          className="absolute inset-[8px] rounded-full"
          style={{
            background: 'linear-gradient(to bottom, #333, #111)',
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)',
          }}
        />

        {/* Vinyl record */}
        <motion.div
          data-testid="vinyl-record"
          className="absolute inset-[15px] md:inset-[20px] rounded-full"
          style={{
            rotate: rotation,
            boxShadow: `0 0 ${20 + bassLevel * 30}px rgba(0, 240, 255, ${0.1 + bassLevel * 0.2})`,
          }}
        >
          {/* Vinyl grooves */}
          <div 
            className="absolute inset-0 rounded-full vinyl-grooves"
            style={{
              background: `
                conic-gradient(from ${rotation}deg, 
                  #0a0a0a, #1a1a1a, #0a0a0a, #151515, 
                  #0a0a0a, #1a1a1a, #0a0a0a, #151515,
                  #0a0a0a, #1a1a1a, #0a0a0a, #151515,
                  #0a0a0a, #1a1a1a, #0a0a0a, #151515
                )
              `,
            }}
          />
          
          {/* Groove rings */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/5"
              style={{
                inset: `${10 + i * 10}%`,
              }}
            />
          ))}

          {/* Center label */}
          <div 
            className="absolute inset-[30%] md:inset-[30%] rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FF003C 0%, #00F0FF 100%)',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            <div className="text-center p-2">
              <div className="text-[8px] md:text-xs font-bold text-white uppercase tracking-widest font-['Rajdhani']">
                {currentStation?.name?.substring(0, 12) || 'CYBERDECK'}
              </div>
              <div className="text-[6px] md:text-[8px] text-white/70 uppercase tracking-wider">
                {isPlaying ? 'ON AIR' : 'READY'}
              </div>
            </div>
            
            {/* Spindle hole */}
            <div className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-black" />
          </div>

          {/* Light reflection */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `linear-gradient(${135 + rotation * 0.1}deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)`,
            }}
          />
        </motion.div>

        {/* Strobe dots for speed indication */}
        <div className="absolute inset-[5px] md:inset-[8px] rounded-full pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/30"
              style={{
                top: '2%',
                left: '50%',
                transform: `rotate(${i * 15 + rotation}deg) translateY(-2px)`,
                transformOrigin: '0 150px',
              }}
            />
          ))}
        </div>

        {/* Tonearm */}
        <motion.div
          data-testid="tonearm"
          className="absolute -right-[20px] md:-right-[30px] top-[20%] origin-top-right"
          style={{ rotate: tonearmAngle }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          {/* Tonearm base */}
          <div 
            className="absolute -top-4 -right-4 w-12 h-12 rounded-full"
            style={{
              background: 'linear-gradient(145deg, #333, #1a1a1a)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          />
          
          {/* Tonearm arm */}
          <div 
            className="w-[140px] md:w-[180px] h-2 rounded-full"
            style={{
              background: 'linear-gradient(to bottom, #555, #333)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
          
          {/* Headshell */}
          <div 
            className="absolute left-0 top-0 w-8 h-4 -translate-x-6 translate-y-[-4px]"
            style={{
              background: 'linear-gradient(to bottom, #444, #222)',
              clipPath: 'polygon(100% 0, 100% 100%, 0 80%, 0 20%)',
            }}
          >
            {/* Cartridge LED */}
            <div 
              className={`absolute bottom-0 left-1 w-1 h-1 rounded-full ${isPlaying ? 'led-on' : 'led-off'}`}
            />
          </div>
        </motion.div>

        {/* Playing indicator LEDs */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`led ${isPlaying && analyserData[i * 10] > 100 ? 'led-on' : 'led-off'}`}
              style={{
                transition: 'all 0.05s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bass pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `2px solid rgba(0, 240, 255, ${bassLevel * 0.5})`,
          scale: 1 + bassLevel * 0.1,
        }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};

export default Turntable;
