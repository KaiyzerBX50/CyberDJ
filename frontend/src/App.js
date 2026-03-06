import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Disc3, Keyboard, Mic, Monitor } from "lucide-react";
import { PioneerDeck } from "./components/PioneerDeck";
import { CentralMixer } from "./components/CentralMixer";
import { DualVisualizer } from "./components/DualVisualizer";
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
  const [crossfade, setCrossfade] = useState(0);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [boothVolume, setBoothVolume] = useState(0.5);
  const [headphoneMix, setHeadphoneMix] = useState(0.5);
  const [headphoneLevel, setHeadphoneLevel] = useState(0.7);

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
      toast.error("Failed to play station");
    }
  };

  // Show error toasts
  useEffect(() => {
    if (deckA.error) toast.error(`Deck A: ${deckA.error}`);
    if (deckB.error) toast.error(`Deck B: ${deckB.error}`);
  }, [deckA.error, deckB.error]);

  // Hide intro
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  const handleKeyPress = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        getActiveDeck().togglePlayPause();
        break;
      case 'a':
        setActiveDeck('A');
        toast.info('Deck A', { duration: 800 });
        break;
      case 'b':
        setActiveDeck('B');
        toast.info('Deck B', { duration: 800 });
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
        } else {
          recorder.startRecording().catch(() => toast.error('Recording failed'));
        }
        break;
      case 'arrowleft':
        setCrossfade(prev => Math.max(-1, prev - 0.1));
        break;
      case 'arrowright':
        setCrossfade(prev => Math.min(1, prev + 0.1));
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

  return (
    <TooltipProvider>
      <div 
        className="min-h-screen bg-[#0a0a0a] relative overflow-x-hidden"
        data-testid="pioneer-dj-app"
      >
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
                exit={{ scale: 1.2, opacity: 0 }}
                className="text-center"
              >
                <div className="flex justify-center gap-6 mb-4">
                  <Disc3 className="w-14 h-14 text-[#00F0FF] animate-spin" style={{ animationDuration: '1.5s' }} />
                  <Disc3 className="w-14 h-14 text-[#FF003C] animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                </div>
                <h1 className="text-3xl font-['Orbitron'] tracking-wider">
                  <span className="text-[#00F0FF]">CYBER</span>
                  <span className="text-white">DECK</span>
                  <span className="text-[#FF003C]"> DJ</span>
                </h1>
                <p className="text-xs font-mono text-white/50 mt-2">XDJ-RX3 STYLE</p>
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
              className="fixed inset-0 z-40 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setShowKeyboardHelp(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="cyber-panel p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-lg font-['Orbitron'] text-[#00F0FF] mb-4 flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  SHORTCUTS
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  {[
                    ['SPACE', 'Play/Pause'],
                    ['A / B', 'Select deck'],
                    ['Q / W', 'Toggle A/B'],
                    ['S', 'Stations'],
                    ['R', 'Record'],
                    ['← →', 'Crossfade'],
                    ['?', 'This help'],
                  ].map(([key, desc]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="text-[#00F0FF] bg-white/10 px-2 rounded">{key}</span>
                      <span className="text-white/60">{desc}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded text-white/60 text-sm"
                >
                  CLOSE
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="relative z-10 px-4 py-2 border-b border-white/10 bg-black/50">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1">
                <Disc3 className={`w-5 h-5 text-[#00F0FF] ${deckA.isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '2s' }} />
                <Disc3 className={`w-5 h-5 text-[#FF003C] ${deckB.isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              </div>
              <div>
                <h1 className="text-sm font-['Orbitron'] font-bold">
                  <span className="text-[#00F0FF]">CYBER</span>
                  <span className="text-white">DECK</span>
                </h1>
              </div>
            </div>

            {/* Now playing indicators */}
            <div className="flex items-center gap-3">
              {deckA.currentStation && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                  <Radio className={`w-3 h-3 ${deckA.isPlaying ? 'text-[#39FF14]' : 'text-white/40'}`} />
                  <span className="text-[10px] text-[#00F0FF]">A: {deckA.currentStation.name?.substring(0, 15)}</span>
                </div>
              )}
              {deckB.currentStation && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#FF003C]/10 border border-[#FF003C]/30">
                  <Radio className={`w-3 h-3 ${deckB.isPlaying ? 'text-[#39FF14]' : 'text-white/40'}`} />
                  <span className="text-[10px] text-[#FF003C]">B: {deckB.currentStation.name?.substring(0, 15)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowKeyboardHelp(true)}
                    className="p-1.5 rounded hover:bg-white/10 text-white/40"
                  >
                    <Keyboard className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Shortcuts (?)</TooltipContent>
              </Tooltip>
              
              <StationBrowser
                onSelectStation={handleSelectStation}
                currentStation={getActiveDeck().currentStation}
                isOpen={isStationBrowserOpen}
                onOpenChange={setIsStationBrowserOpen}
              />
            </div>
          </div>
        </header>

        {/* Main Screen Display - Waveforms */}
        <div className="px-4 py-3 bg-black/30 border-b border-white/10">
          <div className="max-w-[1800px] mx-auto">
            <DualVisualizer
              deckAData={deckA.analyserData}
              deckBData={deckB.analyserData}
              isPlayingA={deckA.isPlaying}
              isPlayingB={deckB.isPlaying}
              crossfade={crossfade}
            />
          </div>
        </div>

        {/* Main DJ Controller Layout */}
        <main className="px-4 py-4">
          <div className="max-w-[1800px] mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-4">
              {/* Deck A */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setActiveDeck('A')}
                className={`cursor-pointer transition-all ${activeDeck === 'A' ? 'ring-2 ring-[#00F0FF]/50 rounded-xl' : ''}`}
              >
                <PioneerDeck
                  deckId="A"
                  isPlaying={deckA.isPlaying}
                  isLoading={deckA.isLoading}
                  currentStation={deckA.currentStation}
                  volume={deckA.volume}
                  analyserData={deckA.analyserData}
                  waveformData={deckA.waveformData}
                  pitch={deckA.pitch}
                  onTogglePlay={deckA.togglePlayPause}
                  onPitchChange={deckA.updatePitch}
                  onVolumeChange={deckA.updateVolume}
                />
              </motion.div>

              {/* Center Mixer */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-4"
              >
                <CentralMixer
                  deckA={deckA}
                  deckB={deckB}
                  crossfade={crossfade}
                  onCrossfadeChange={setCrossfade}
                  masterVolume={masterVolume}
                  onMasterVolumeChange={setMasterVolume}
                  boothVolume={boothVolume}
                  onBoothVolumeChange={setBoothVolume}
                  headphoneMix={headphoneMix}
                  onHeadphoneMixChange={setHeadphoneMix}
                  headphoneLevel={headphoneLevel}
                  onHeadphoneLevelChange={setHeadphoneLevel}
                />

                {/* Recording Panel */}
                <RecordingPanel
                  isRecording={recorder.isRecording}
                  recordingDuration={recorder.recordingDuration}
                  recordedBlob={recorder.recordedBlob}
                  recordingUrl={recorder.recordingUrl}
                  onStartRecording={() => recorder.startRecording().catch(() => toast.error('Recording failed'))}
                  onStopRecording={recorder.stopRecording}
                  onDownload={recorder.downloadRecording}
                  onClear={recorder.clearRecording}
                  formatDuration={recorder.formatDuration}
                />
              </motion.div>

              {/* Deck B */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setActiveDeck('B')}
                className={`cursor-pointer transition-all ${activeDeck === 'B' ? 'ring-2 ring-[#FF003C]/50 rounded-xl' : ''}`}
              >
                <PioneerDeck
                  deckId="B"
                  isPlaying={deckB.isPlaying}
                  isLoading={deckB.isLoading}
                  currentStation={deckB.currentStation}
                  volume={deckB.volume}
                  analyserData={deckB.analyserData}
                  waveformData={deckB.waveformData}
                  pitch={deckB.pitch}
                  onTogglePlay={deckB.togglePlayPause}
                  onPitchChange={deckB.updatePitch}
                  onVolumeChange={deckB.updateVolume}
                />
              </motion.div>
            </div>
          </div>
        </main>

        {/* Empty state */}
        {!deckA.currentStation && !deckB.currentStation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2"
          >
            <button
              onClick={() => setIsStationBrowserOpen(true)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00F0FF]/20 to-[#FF003C]/20 border border-white/20 hover:border-white/40 transition-all"
            >
              <span className="text-sm font-['Rajdhani'] text-white">LOAD A STATION TO BEGIN</span>
            </button>
          </motion.div>
        )}

        {/* Footer */}
        <footer className="relative z-10 p-2 text-center border-t border-white/5">
          <p className="text-[8px] font-mono text-white/20">
            CYBERDECK DJ • PIONEER XDJ-RX3 STYLE • PRESS ? FOR SHORTCUTS
          </p>
        </footer>

        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111',
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
