import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const JogWheel = ({ 
  isPlaying, 
  analyserData, 
  deckId = 'A',
  onScratch,
  onNudge 
}) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, angle: 0 });
  const rotationRef = useRef(0);
  const animationRef = useRef(null);
  const wheelRef = useRef(null);

  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';
  const bassLevel = analyserData.slice(0, 8).reduce((a, b) => a + b, 0) / 8 / 255;

  // Auto rotation when playing
  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      if (isPlaying && !isDragging) {
        const speed = 180 * (1 + bassLevel * 0.05);
        rotationRef.current = (rotationRef.current + speed * deltaTime) % 360;
        setRotation(rotationRef.current);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, isDragging, bassLevel]);

  // Calculate angle from center
  const getAngle = (clientX, clientY) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setTouchStart({
      x: e.clientX,
      y: e.clientY,
      angle: getAngle(e.clientX, e.clientY),
      rotation: rotation
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentAngle = getAngle(e.clientX, e.clientY);
    const deltaAngle = currentAngle - touchStart.angle;
    const newRotation = (touchStart.rotation + deltaAngle + 360) % 360;
    setRotation(newRotation);
    rotationRef.current = newRotation;
    onScratch?.(deltaAngle);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, touchStart]);

  return (
    <div 
      className="relative"
      data-testid={`jog-wheel-${deckId.toLowerCase()}`}
    >
      {/* Outer housing */}
      <div 
        className="relative w-[240px] h-[240px] md:w-[300px] md:h-[300px] rounded-full"
        style={{
          background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
          boxShadow: `
            inset 0 0 30px rgba(0,0,0,0.8),
            0 0 ${isPlaying ? 30 : 10}px ${deckColor}30
          `,
        }}
      >
        {/* Illuminated outer ring */}
        <div 
          className="absolute inset-2 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, ${deckColor}20, ${deckColor}60, ${deckColor}20, ${deckColor}60, ${deckColor}20)`,
            filter: `blur(2px)`,
            opacity: isPlaying ? 1 : 0.3,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Jog wheel platter */}
        <div 
          ref={wheelRef}
          className="absolute inset-4 rounded-full cursor-grab active:cursor-grabbing"
          style={{
            background: 'linear-gradient(145deg, #222, #111)',
            boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.5)',
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Rotating center section */}
          <motion.div
            className="absolute inset-6 rounded-full"
            style={{ rotate: rotation }}
          >
            {/* Vinyl texture rings */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white/5"
                style={{ 
                  inset: `${i * 6}%`,
                }}
              />
            ))}

            {/* Center artwork - Pioneer style multicolor */}
            <div 
              className="absolute inset-[25%] rounded-full overflow-hidden"
              style={{
                background: `
                  conic-gradient(
                    from ${rotation}deg,
                    #FF003C, #FF6600, #FFD700, #39FF14, 
                    #00F0FF, #0066FF, #9900FF, #FF003C
                  )
                `,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
              }}
            >
              {/* Inner black ring */}
              <div 
                className="absolute inset-[15%] rounded-full bg-black/80 flex items-center justify-center"
              >
                <span className="text-[10px] md:text-xs font-['Orbitron'] font-bold text-white/80">
                  {deckId}
                </span>
              </div>
            </div>

            {/* Position marker */}
            <div 
              className="absolute top-[8%] left-1/2 w-1 h-4 -translate-x-1/2 rounded-full"
              style={{ background: deckColor }}
            />
          </motion.div>

          {/* Touch-sensitive indicator ring */}
          <div 
            className={`absolute inset-0 rounded-full border-2 transition-all duration-200 ${isDragging ? 'opacity-100' : 'opacity-0'}`}
            style={{ borderColor: deckColor }}
          />
        </div>

        {/* Status LEDs around edge */}
        {[...Array(16)].map((_, i) => {
          const angle = (i / 16) * 360;
          const isActive = isPlaying && analyserData[i * 4] > 128;
          return (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translateY(-115px) translateX(-50%)`,
                background: isActive ? deckColor : '#333',
                boxShadow: isActive ? `0 0 6px ${deckColor}` : 'none',
                transition: 'all 0.1s ease',
              }}
            />
          );
        })}
      </div>

      {/* Deck label */}
      <div 
        className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded text-[10px] font-['Orbitron'] font-bold"
        style={{ 
          background: '#111',
          color: deckColor,
          border: `1px solid ${deckColor}40`
        }}
      >
        DECK {deckId}
      </div>
    </div>
  );
};

export default JogWheel;
