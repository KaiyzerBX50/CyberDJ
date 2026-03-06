import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Disc3, Keyboard, Info } from "lucide-react";
import { DualTurntable } from "./components/DualTurntable";
import { DualVisualizer } from "./components/DualVisualizer";
import { FullDeckControls } from "./components/FullDeckControls";
import { Crossfader } from "./components/Crossfader";
import { StationBrowser } from "./components/StationBrowser";
import { RecordingPanel } from "./components/RecordingPanel";
import { useAudioDeck } from "./hooks/useAudioDeck";
import { useRecorder } from "./hooks/useRecorder";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";

function App() {
  const [isStationBrowserOpen, setIsStationBrowserOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [activeDeck, setActiveDeck] = useState('A');
  const [crossfade, setCrossfade] = useState(0); // -1 = full A, 0 = center, 1 = full B
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Dual deck audio hooks
  const deckA = useAudioDeck('A');
  const deckB = useAudioDeck('B');
  
  // Recording hook
  const recorder = useRecorder();

  // Get active deck
  const getActiveDeck = () => activeDeck === 'A' ? deckA : deckB;

  // Handle station selection for active deck
  const handleSelectStation = async (station) => {
    const deck = getActiveDeck();
    try {
      await deck.playStation(station);
      toast.success(`Deck ${activeDeck}: ${station.name}`, {
        description: station.country || "Now playing",
        duration: 3000,
      });
    } catch (err) {
      toast.error("Failed to play station", {
        description: "Try another station",
      });
    }
  };

  // Show error toasts
  useEffect(() => {
    if (deckA.error) toast.error(`Deck A: ${deckA.error}`);
    if (deckB.error) toast.error(`Deck B: ${deckB.error}`);
  }, [deckA.error, deckB.error]);

  // Hide intro after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  const handleKeyPress = useCallback((e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        getActiveDeck().togglePlayPause();
        break;
      case 'a':
        setActiveDeck('A');
        toast.info('Deck A selected', { duration: 1000 });
        break;
      case 'b':
        setActiveDeck('B');
        toast.info('Deck B selected', { duration: 1000 });
        break;
      case 'q':
        deckA.togglePlayPause();
        break;
      case 'w':
        deckB.togglePlayPause();
        break;
      case 's':
        setIsStationBrowserOpen(true);
        break;
      case 'r':
        if (recorder.isRecording) {
          recorder.stopRecording();
          toast.success('Recording stopped');
        } else {
          recorder.startRecording().catch(() => {
            toast.error('Failed to start recording');
          });
          toast.success('Recording started');
        }
        break;
      case 'arrowleft':
        setCrossfade(prev => Math.max(-1, prev - 0.1));
        break;
      case 'arrowright':
        setCrossfade(prev => Math.min(1, prev + 0.1));
        break;
      case 'arrowup':
        getActiveDeck().updateVolume(Math.min(1, getActiveDeck().volume + 0.05));
        break;
      case 'arrowdown':
        getActiveDeck().updateVolume(Math.max(0, getActiveDeck().volume - 0.05));
        break;
      case '?':
        setShowKeyboardHelp(prev => !prev);
        break;
      default:
        break;
    }
  }, [deckA, deckB, activeDeck, recorder]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Calculate reactive background based on combined audio
  const combinedLevel = (
    (deckA.analyserData.reduce((a, b) => a + b, 0) / deckA.analyserData.length / 255) * (crossfade <= 0 ? 1 : 1 - crossfade) +
    (deckB.analyserData.reduce((a, b) => a + b, 0) / deckB.analyserData.length / 255) * (crossfade >= 0 ? 1 : 1 + crossfade)
  );

  return (
    <TooltipProvider>
      <div 
        className="min-h-screen bg-[#050505] relative overflow-hidden"
        data-testid="dj-turntable-app"
      >
        {/* Animated background */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, 
              rgba(0, 240, 255, ${0.02 + combinedLevel * 0.04}) 0%, 
              transparent 50%
            ), radial-gradient(ellipse at 70% 50%, 
              rgba(255, 0, 60, ${0.02 + combinedLevel * 0.04}) 0%, 
              transparent 50%
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
                className="text-center"
              >
                <div className="flex justify-center gap-4 mb-4">
                  <Disc3 className="w-16 h-16 text-[#00F0FF] animate-spin" style={{ animationDuration: '2s' }} />
                  <Disc3 className="w-16 h-16 text-[#FF003C] animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                </div>
                <h1 className="text-4xl font-['Orbitron'] text-white tracking-widest">
                  <span className="text-[#00F0FF]">CYBER</span>
                  <span className="text-[#FF003C]">DECK</span>
                </h1>
                <p className="text-sm font-mono text-white/50 mt-2 tracking-wider">
                  DUAL DECK DJ SYSTEM v2.0
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard help modal */}
        <AnimatePresence>
          {showKeyboardHelp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setShowKeyboardHelp(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="cyber-panel p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-lg font-['Orbitron'] text-[#00F0FF] mb-4 flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  KEYBOARD SHORTCUTS
                </h2>
                <div className="space-y-2 text-sm font-mono">
                  {[
                    ['SPACE', 'Play/Pause active deck'],
                    ['A / B', 'Select deck A / B'],
                    ['Q / W', 'Toggle play deck A / B'],
                    ['S', 'Open station browser'],
                    ['R', 'Start/Stop recording'],
                    ['← / →', 'Move crossfader'],
                    ['↑ / ↓', 'Volume up/down'],
                    ['?', 'Toggle this help'],
                  ].map(([key, desc]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-[#00F0FF] bg-white/10 px-2 py-0.5 rounded">{key}</span>
                      <span className="text-white/60">{desc}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded text-white/60 text-sm"
                >
                  Close (ESC)
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="relative z-10 p-3 md:p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex -space-x-2">
                <Disc3 
                  className={`w-6 h-6 text-[#00F0FF] ${deckA.isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '2s' }}
                />
                <Disc3 
                  className={`w-6 h-6 text-[#FF003C] ${deckB.isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '2s', animationDirection: 'reverse' }}
                />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-['Orbitron'] font-bold tracking-wider">
                  <span className="text-[#00F0FF]">CYBER</span>
                  <span className="text-[#FF003C]">DECK</span>
                </h1>
                <p className="text-[8px] font-mono text-white/40 tracking-widest">
                  DUAL DECK DJ SYSTEM
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowKeyboardHelp(true)}
                    className="p-2 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    data-testid="keyboard-help-btn"
                  >
                    <Keyboard className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keyboard shortcuts (?)</p>
                </TooltipContent>
              </Tooltip>
              
              <StationBrowser
                onSelectStation={handleSelectStation}
                currentStation={getActiveDeck().currentStation}
                isOpen={isStationBrowserOpen}
                onOpenChange={setIsStationBrowserOpen}
              />
            </motion.div>
          </div>
        </header>

        {/* Now Playing banners */}
        <div className="relative z-10 px-4 flex justify-center gap-4 mb-4">
          {deckA.currentStation && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30"
            >
              <Radio className={`w-3 h-3 ${deckA.isPlaying ? 'text-[#39FF14] animate-pulse' : 'text-white/40'}`} />
              <span className="text-xs font-['Rajdhani'] text-[#00F0FF]">A: {deckA.currentStation.name}</span>
            </motion.div>
          )}
          {deckB.currentStation && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#FF003C]/10 border border-[#FF003C]/30"
            >
              <Radio className={`w-3 h-3 ${deckB.isPlaying ? 'text-[#39FF14] animate-pulse' : 'text-white/40'}`} />
              <span className="text-xs font-['Rajdhani'] text-[#FF003C]">B: {deckB.currentStation.name}</span>
            </motion.div>
          )}
        </div>

        {/* Main content */}
        <main className="relative z-10 px-3 md:px-4 pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Dual Deck Layout */}
            <div className="grid grid-cols-12 gap-3 md:gap-4">
              {/* Deck A Turntable */}
              <motion.div 
                className="col-span-12 md:col-span-3 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <DualTurntable
                  isPlaying={deckA.isPlaying}
                  analyserData={deckA.analyserData}
                  currentStation={deckA.currentStation}
                  deckId="A"
                  isActive={activeDeck === 'A'}
                />
              </motion.div>

              {/* Center - Visualizer + Crossfader */}
              <motion.div 
                className="col-span-12 md:col-span-6 space-y-3"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {/* Dual Visualizer */}
                <DualVisualizer
                  deckAData={deckA.analyserData}
                  deckBData={deckB.analyserData}
                  isPlayingA={deckA.isPlaying}
                  isPlayingB={deckB.isPlaying}
                  crossfade={crossfade}
                />

                {/* Crossfader */}
                <div className="cyber-panel p-4">
                  <Crossfader
                    value={crossfade}
                    onChange={setCrossfade}
                  />
                </div>

                {/* Recording Panel */}
                <RecordingPanel
                  isRecording={recorder.isRecording}
                  recordingDuration={recorder.recordingDuration}
                  recordedBlob={recorder.recordedBlob}
                  recordingUrl={recorder.recordingUrl}
                  onStartRecording={() => {
                    recorder.startRecording().catch(() => {
                      toast.error('Recording failed', { description: 'Make sure to allow screen/audio capture' });
                    });
                  }}
                  onStopRecording={recorder.stopRecording}
                  onDownload={recorder.downloadRecording}
                  onClear={recorder.clearRecording}
                  formatDuration={recorder.formatDuration}
                />
              </motion.div>

              {/* Deck B Turntable */}
              <motion.div 
                className="col-span-12 md:col-span-3 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <DualTurntable
                  isPlaying={deckB.isPlaying}
                  analyserData={deckB.analyserData}
                  currentStation={deckB.currentStation}
                  deckId="B"
                  isActive={activeDeck === 'B'}
                />
              </motion.div>
            </div>

            {/* Deck Controls Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <FullDeckControls
                  deckId="A"
                  isPlaying={deckA.isPlaying}
                  isLoading={deckA.isLoading}
                  volume={deckA.volume}
                  bass={deckA.bass}
                  mid={deckA.mid}
                  treble={deckA.treble}
                  echo={deckA.echo}
                  reverb={deckA.reverb}
                  filter={deckA.filter}
                  pitch={deckA.pitch}
                  analyserData={deckA.analyserData}
                  waveformData={deckA.waveformData}
                  onTogglePlay={deckA.togglePlayPause}
                  onVolumeChange={deckA.updateVolume}
                  onBassChange={deckA.updateBass}
                  onMidChange={deckA.updateMid}
                  onTrebleChange={deckA.updateTreble}
                  onEchoChange={deckA.updateEcho}
                  onReverbChange={deckA.updateReverb}
                  onFilterChange={deckA.updateFilter}
                  onPitchChange={deckA.updatePitch}
                  currentStation={deckA.currentStation}
                  isActive={activeDeck === 'A'}
                  onActivate={() => setActiveDeck('A')}
                />
              </motion.div>
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <FullDeckControls
                  deckId="B"
                  isPlaying={deckB.isPlaying}
                  isLoading={deckB.isLoading}
                  volume={deckB.volume}
                  bass={deckB.bass}
                  mid={deckB.mid}
                  treble={deckB.treble}
                  echo={deckB.echo}
                  reverb={deckB.reverb}
                  filter={deckB.filter}
                  pitch={deckB.pitch}
                  analyserData={deckB.analyserData}
                  waveformData={deckB.waveformData}
                  onTogglePlay={deckB.togglePlayPause}
                  onVolumeChange={deckB.updateVolume}
                  onBassChange={deckB.updateBass}
                  onMidChange={deckB.updateMid}
                  onTrebleChange={deckB.updateTreble}
                  onEchoChange={deckB.updateEcho}
                  onReverbChange={deckB.updateReverb}
                  onFilterChange={deckB.updateFilter}
                  onPitchChange={deckB.updatePitch}
                  currentStation={deckB.currentStation}
                  isActive={activeDeck === 'B'}
                  onActivate={() => setActiveDeck('B')}
                />
              </motion.div>
            </div>

            {/* Empty state prompt */}
            {!deckA.currentStation && !deckB.currentStation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-6 text-center"
                data-testid="empty-state-prompt"
              >
                <button
                  onClick={() => setIsStationBrowserOpen(true)}
                  className="group inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-gradient-to-r from-[#00F0FF]/10 to-[#FF003C]/10 border border-white/10 hover:border-[#00F0FF]/50 transition-all duration-300"
                >
                  <Radio className="w-5 h-5 text-[#00F0FF] group-hover:animate-pulse" />
                  <span className="text-base font-['Rajdhani'] font-semibold text-white group-hover:text-[#00F0FF] transition-colors">
                    LOAD A STATION TO BEGIN
                  </span>
                </button>
                <p className="mt-2 text-[10px] font-mono text-white/30">
                  Press S to open stations • Press ? for all shortcuts
                </p>
              </motion.div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 p-3 text-center">
          <p className="text-[9px] font-mono text-white/20 tracking-widest">
            POWERED BY RADIO BROWSER API • PRESS ? FOR KEYBOARD SHORTCUTS
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
    </TooltipProvider>
  );
}

export default App;
