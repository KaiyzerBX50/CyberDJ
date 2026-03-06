import { useState, useRef, useCallback, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const useAudioDeck = (deckId = 'A') => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [volume, setVolume] = useState(0.75);
  const [bass, setBass] = useState(0);
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(0);
  const [echo, setEcho] = useState(0);
  const [reverb, setReverb] = useState(0);
  const [filter, setFilter] = useState(0); // -1 = low pass, 0 = off, 1 = high pass
  const [pitch, setPitch] = useState(0); // -1 to 1 = -8% to +8%
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
  const midFilterRef = useRef(null);
  const trebleFilterRef = useRef(null);
  const delayNodeRef = useRef(null);
  const delayGainRef = useRef(null);
  const convolverRef = useRef(null);
  const reverbGainRef = useRef(null);
  const filterNodeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isConnectedRef = useRef(false);
  const outputNodeRef = useRef(null);

  // Create impulse response for reverb
  const createReverbImpulse = useCallback((context, duration = 2, decay = 2) => {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }, []);

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

      // Create mid filter (peaking)
      midFilterRef.current = audioContextRef.current.createBiquadFilter();
      midFilterRef.current.type = 'peaking';
      midFilterRef.current.frequency.value = 1000;
      midFilterRef.current.Q.value = 1;
      midFilterRef.current.gain.value = mid;
      
      // Create treble filter (high shelf)
      trebleFilterRef.current = audioContextRef.current.createBiquadFilter();
      trebleFilterRef.current.type = 'highshelf';
      trebleFilterRef.current.frequency.value = 3000;
      trebleFilterRef.current.gain.value = treble;

      // Create delay (echo) node
      delayNodeRef.current = audioContextRef.current.createDelay(1.0);
      delayNodeRef.current.delayTime.value = 0.3;
      delayGainRef.current = audioContextRef.current.createGain();
      delayGainRef.current.gain.value = 0;

      // Create convolver (reverb) node
      convolverRef.current = audioContextRef.current.createConvolver();
      convolverRef.current.buffer = createReverbImpulse(audioContextRef.current);
      reverbGainRef.current = audioContextRef.current.createGain();
      reverbGainRef.current.gain.value = 0;

      // Create filter node (low/high pass)
      filterNodeRef.current = audioContextRef.current.createBiquadFilter();
      filterNodeRef.current.type = 'allpass';
      filterNodeRef.current.frequency.value = 1000;
      filterNodeRef.current.Q.value = 1;

      // Output node for routing to master
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.gain.value = 1;
    }
    return audioContextRef.current;
  }, [volume, bass, treble, createReverbImpulse]);

  // Connect audio nodes
  const connectNodes = useCallback(() => {
    if (isConnectedRef.current || !audioRef.current || !audioContextRef.current) return;
    
    try {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      
      // Main chain: source -> bass -> mid -> treble -> filter -> gain -> analyser -> output
      sourceRef.current.connect(bassFilterRef.current);
      bassFilterRef.current.connect(midFilterRef.current);
      midFilterRef.current.connect(trebleFilterRef.current);
      trebleFilterRef.current.connect(filterNodeRef.current);
      filterNodeRef.current.connect(gainNodeRef.current);
      
      // Echo chain (parallel)
      gainNodeRef.current.connect(delayNodeRef.current);
      delayNodeRef.current.connect(delayGainRef.current);
      delayGainRef.current.connect(delayNodeRef.current); // Feedback
      delayGainRef.current.connect(analyserRef.current);

      // Reverb chain (parallel)
      gainNodeRef.current.connect(convolverRef.current);
      convolverRef.current.connect(reverbGainRef.current);
      reverbGainRef.current.connect(analyserRef.current);

      // Dry signal
      gainNodeRef.current.connect(analyserRef.current);
      
      // Final output
      analyserRef.current.connect(outputNodeRef.current);
      outputNodeRef.current.connect(audioContextRef.current.destination);
      
      isConnectedRef.current = true;
    } catch (e) {
      console.warn('Audio nodes already connected or error:', e);
    }
  }, []);

  // Get output node for master mixing
  const getOutputNode = useCallback(() => {
    return outputNodeRef.current;
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
      
      // Use proxy URL to bypass CORS
      const streamUrl = station.url_resolved || station.url;
      const proxyUrl = `${BACKEND_URL}/api/stream?url=${encodeURIComponent(streamUrl)}`;
      
      audioRef.current.src = proxyUrl;
      audioRef.current.volume = 1;
      
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
      bassFilterRef.current.gain.value = newBass * 10;
    }
  }, []);

  // Update mid
  const updateMid = useCallback((newMid) => {
    setMid(newMid);
    if (midFilterRef.current) {
      midFilterRef.current.gain.value = newMid * 10;
    }
  }, []);

  // Update treble
  const updateTreble = useCallback((newTreble) => {
    setTreble(newTreble);
    if (trebleFilterRef.current) {
      trebleFilterRef.current.gain.value = newTreble * 10;
    }
  }, []);

  // Update pitch (playback rate)
  const updatePitch = useCallback((newPitch) => {
    setPitch(newPitch);
    if (audioRef.current) {
      // Convert -1 to 1 range to 0.92 to 1.08 playback rate
      audioRef.current.playbackRate = 1 + (newPitch * 0.08);
    }
  }, []);

  // Update echo
  const updateEcho = useCallback((newEcho) => {
    setEcho(newEcho);
    if (delayGainRef.current) {
      delayGainRef.current.gain.value = newEcho * 0.6;
    }
  }, []);

  // Update reverb
  const updateReverb = useCallback((newReverb) => {
    setReverb(newReverb);
    if (reverbGainRef.current) {
      reverbGainRef.current.gain.value = newReverb;
    }
  }, []);

  // Update filter
  const updateFilter = useCallback((newFilter) => {
    setFilter(newFilter);
    if (filterNodeRef.current) {
      if (newFilter < -0.1) {
        filterNodeRef.current.type = 'lowpass';
        filterNodeRef.current.frequency.value = 200 + (1 + newFilter) * 4800; // 200-5000 Hz
      } else if (newFilter > 0.1) {
        filterNodeRef.current.type = 'highpass';
        filterNodeRef.current.frequency.value = 100 + newFilter * 4900; // 100-5000 Hz
      } else {
        filterNodeRef.current.type = 'allpass';
      }
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
    deckId,
    isPlaying,
    isLoading,
    error,
    currentStation,
    volume,
    bass,
    mid,
    treble,
    echo,
    reverb,
    filter,
    pitch,
    analyserData,
    waveformData,
    playStation,
    togglePlayPause,
    updateVolume,
    updateBass,
    updateMid,
    updateTreble,
    updateEcho,
    updateReverb,
    updateFilter,
    updatePitch,
    getOutputNode,
    audioContext: audioContextRef.current,
  };
};

export default useAudioDeck;
