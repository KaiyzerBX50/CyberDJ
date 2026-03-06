import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [volume, setVolume] = useState(0.75);
  const [bass, setBass] = useState(0);
  const [treble, setTreble] = useState(0);
  const [analyserData, setAnalyserData] = useState(new Uint8Array(128));
  const [waveformData, setWaveformData] = useState(new Uint8Array(128));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const gainNodeRef = useRef(null);
  const bassFilterRef = useRef(null);
  const trebleFilterRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isConnectedRef = useRef(false);

  // Initialize audio context and nodes
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Create gain node
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      
      // Create bass filter (low shelf)
      bassFilterRef.current = audioContextRef.current.createBiquadFilter();
      bassFilterRef.current.type = 'lowshelf';
      bassFilterRef.current.frequency.value = 200;
      bassFilterRef.current.gain.value = bass;
      
      // Create treble filter (high shelf)
      trebleFilterRef.current = audioContextRef.current.createBiquadFilter();
      trebleFilterRef.current.type = 'highshelf';
      trebleFilterRef.current.frequency.value = 3000;
      trebleFilterRef.current.gain.value = treble;
    }
    return audioContextRef.current;
  }, [volume, bass, treble]);

  // Connect audio nodes
  const connectNodes = useCallback(() => {
    if (isConnectedRef.current || !audioRef.current || !audioContextRef.current) return;
    
    try {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      
      // Chain: source -> bass -> treble -> gain -> analyser -> destination
      sourceRef.current.connect(bassFilterRef.current);
      bassFilterRef.current.connect(trebleFilterRef.current);
      trebleFilterRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      isConnectedRef.current = true;
    } catch (e) {
      console.warn('Audio nodes already connected or error:', e);
    }
  }, []);

  // Update analyser data
  const updateAnalyserData = useCallback(() => {
    if (!analyserRef.current || !isPlaying) return;

    const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
    const timeData = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    analyserRef.current.getByteFrequencyData(frequencyData);
    analyserRef.current.getByteTimeDomainData(timeData);
    
    setAnalyserData(frequencyData);
    setWaveformData(timeData);
    
    animationFrameRef.current = requestAnimationFrame(updateAnalyserData);
  }, [isPlaying]);

  // Play station
  const playStation = useCallback(async (station) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const ctx = initAudioContext();
      
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = 'anonymous';
      }
      
      // Stop current playback
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      
      audioRef.current.src = station.url_resolved || station.url;
      audioRef.current.volume = 1; // Volume controlled by gain node
      
      connectNodes();
      
      await audioRef.current.play();
      setIsPlaying(true);
      setCurrentStation(station);
      updateAnalyserData();
      
    } catch (err) {
      console.error('Error playing station:', err);
      setError('Failed to play station. Try another one.');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [initAudioContext, connectNodes, updateAnalyserData, isPlaying]);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current || !currentStation) return;
    
    try {
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        updateAnalyserData();
      }
    } catch (err) {
      console.error('Error toggling playback:', err);
    }
  }, [isPlaying, currentStation, updateAnalyserData]);

  // Update volume
  const updateVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  }, []);

  // Update bass
  const updateBass = useCallback((newBass) => {
    setBass(newBass);
    if (bassFilterRef.current) {
      bassFilterRef.current.gain.value = newBass * 10; // Scale for audible effect
    }
  }, []);

  // Update treble
  const updateTreble = useCallback((newTreble) => {
    setTreble(newTreble);
    if (trebleFilterRef.current) {
      trebleFilterRef.current.gain.value = newTreble * 10; // Scale for audible effect
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Start animation loop when playing
  useEffect(() => {
    if (isPlaying) {
      updateAnalyserData();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateAnalyserData]);

  return {
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
  };
};

export default useAudio;
