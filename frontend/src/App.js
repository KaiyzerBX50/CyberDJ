import { useState, useEffect } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Disc3, Waves, Settings2, Info } from "lucide-react";
import { Turntable } from "./components/Turntable";
import { Visualizer } from "./components/Visualizer";
import { ControlPanel } from "./components/ControlPanel";
import { StationBrowser } from "./components/StationBrowser";
import { useAudio } from "./hooks/useAudio";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

function App() {
  const [isStationBrowserOpen, setIsStationBrowserOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const {
    isPlaying,
    isLoading,
    error,
    currentStation,
    volume,
    bass,
    treble,
    analyserData,
    waveformData,
    playStation,
    togglePlayPause,
    updateVolume,
    updateBass,
    updateTreble,
  } = useAudio();

  // Handle station selection
  const handleSelectStation = async (station) => {
    try {
      await playStation(station);
      toast.success(`Now playing: ${station.name}`, {
        description: station.country || "Unknown location",
        duration: 3000,
      });
    } catch (err) {
      toast.error("Failed to play station", {
        description: "Try another station",
      });
    }
  };

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Hide intro after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate reactive values for background effects
  const bassLevel = analyserData.slice(0, 8).reduce((a, b) => a + b, 0) / 8 / 255;
  const avgLevel = analyserData.reduce((a, b) => a + b, 0) / analyserData.length / 255;

  return (
    <div 
      className="min-h-screen bg-[#050505] relative overflow-hidden"
      data-testid="dj-turntable-app"
    >
      {/* Animated background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, 
            rgba(0, 240, 255, ${0.03 + bassLevel * 0.05}) 0%, 
            rgba(255, 0, 60, ${0.02 + avgLevel * 0.03}) 50%, 
            transparent 70%
          )`,
          transition: "background 0.1s ease",
        }}
      />

      {/* Grid background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Intro animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Disc3 className="w-20 h-20 text-[#00F0FF] mx-auto mb-4 animate-spin" />
              <h1 className="text-4xl font-['Orbitron'] text-[#00F0FF] tracking-widest text-glow-cyan">
                CYBERDECK
              </h1>
              <p className="text-sm font-mono text-white/50 mt-2 tracking-wider">
                INITIALIZING AUDIO MATRIX...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Disc3 
              className={`w-8 h-8 text-[#00F0FF] ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '2s' }}
            />
            <div>
              <h1 className="text-xl md:text-2xl font-['Orbitron'] font-bold tracking-wider text-[#00F0FF] text-glow-cyan">
                CYBERDECK
              </h1>
              <p className="text-[10px] font-mono text-white/40 tracking-widest">
                DIGITAL TURNTABLE v1.0
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="flex items-center gap-3"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <StationBrowser
              onSelectStation={handleSelectStation}
              currentStation={currentStation}
              isOpen={isStationBrowserOpen}
              onOpenChange={setIsStationBrowserOpen}
            />
          </motion.div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 md:px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Now Playing banner */}
          <AnimatePresence>
            {currentStation && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="mb-6 text-center"
                data-testid="now-playing-banner"
              >
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-black/50 border border-white/10">
                  <Radio className={`w-4 h-4 ${isPlaying ? 'text-[#39FF14] animate-pulse' : 'text-white/40'}`} />
                  <span className="text-sm font-['Rajdhani'] font-semibold text-white">
                    {currentStation.name}
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    {currentStation.country}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main deck layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Turntable section */}
            <motion.div 
              className="lg:col-span-5 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              <div className="relative">
                <Turntable
                  isPlaying={isPlaying}
                  analyserData={analyserData}
                  currentStation={currentStation}
                />
                
                {/* Glow effect under turntable */}
                <div 
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 rounded-full blur-2xl pointer-events-none"
                  style={{
                    background: `rgba(0, 240, 255, ${0.1 + bassLevel * 0.2})`,
                    transition: "background 0.1s ease",
                  }}
                />
              </div>
            </motion.div>

            {/* Right panel - Visualizer + Controls */}
            <motion.div 
              className="lg:col-span-7 space-y-6"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {/* Visualizer */}
              <Visualizer
                analyserData={analyserData}
                waveformData={waveformData}
                isPlaying={isPlaying}
              />

              {/* Control Panel */}
              <ControlPanel
                isPlaying={isPlaying}
                isLoading={isLoading}
                volume={volume}
                bass={bass}
                treble={treble}
                analyserData={analyserData}
                onTogglePlay={togglePlayPause}
                onVolumeChange={updateVolume}
                onBassChange={updateBass}
                onTrebleChange={updateTreble}
                currentStation={currentStation}
              />
            </motion.div>
          </div>

          {/* Empty state prompt */}
          {!currentStation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8 text-center"
              data-testid="empty-state-prompt"
            >
              <button
                onClick={() => setIsStationBrowserOpen(true)}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-gradient-to-r from-[#00F0FF]/10 to-[#FF003C]/10 border border-white/10 hover:border-[#00F0FF]/50 transition-all duration-300"
              >
                <Radio className="w-6 h-6 text-[#00F0FF] group-hover:animate-pulse" />
                <span className="text-lg font-['Rajdhani'] font-semibold text-white group-hover:text-[#00F0FF] transition-colors">
                  SELECT A STATION TO BEGIN
                </span>
              </button>
              <p className="mt-3 text-xs font-mono text-white/30">
                Browse Hip Hop, R&B, Trap, and Soul stations
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center">
        <p className="text-[10px] font-mono text-white/20 tracking-widest">
          POWERED BY RADIO BROWSER API
        </p>
      </footer>

      {/* Toast notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0A0A0A',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;
