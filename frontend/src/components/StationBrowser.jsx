import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Search, Loader2, Music2, X, Wifi, WifiOff } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import { Input } from '../components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const StationBrowser = ({ onSelectStation, currentStation, isOpen, onOpenChange }) => {
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('hip hop');
  const [error, setError] = useState(null);

  const genres = [
    { id: 'hip hop', label: 'HIP HOP', color: '#FF003C' },
    { id: 'rnb', label: 'R&B', color: '#00F0FF' },
    { id: 'trap', label: 'TRAP', color: '#39FF14' },
    { id: 'soul', label: 'SOUL', color: '#FFD700' },
  ];

  const fetchStations = async (genre) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API}/stations`, {
        params: { tag: genre, limit: 30 }
      });
      setStations(response.data);
    } catch (err) {
      console.error('Error fetching stations:', err);
      setError('Failed to load stations');
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStations(activeGenre);
  }, [activeGenre]);

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          data-testid="open-station-browser"
          variant="outline"
          className="bg-transparent border-[#00F0FF]/30 hover:border-[#00F0FF] hover:bg-[#00F0FF]/10 text-[#00F0FF] transition-all duration-300"
        >
          <Radio className="w-4 h-4 mr-2" />
          <span className="font-['Rajdhani'] tracking-wider">STATIONS</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-[350px] sm:w-[400px] bg-[#0A0A0A] border-l border-white/10 p-0"
        data-testid="station-browser-panel"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <SheetHeader>
            <SheetTitle className="text-[#00F0FF] font-['Orbitron'] tracking-wider text-lg flex items-center gap-2">
              <Music2 className="w-5 h-5" />
              RADIO CRATE
            </SheetTitle>
          </SheetHeader>
          
          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              data-testid="station-search-input"
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/50 border-white/10 focus:border-[#00F0FF] text-white font-mono text-sm"
            />
          </div>
          
          {/* Genre tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {genres.map((genre) => (
              <button
                key={genre.id}
                data-testid={`genre-tab-${genre.id.replace(' ', '-')}`}
                onClick={() => setActiveGenre(genre.id)}
                className={`
                  px-3 py-1 text-[10px] font-mono tracking-wider rounded
                  transition-all duration-200
                  ${activeGenre === genre.id 
                    ? 'text-black' 
                    : 'text-white/60 hover:text-white bg-transparent border border-white/20 hover:border-white/40'
                  }
                `}
                style={{
                  backgroundColor: activeGenre === genre.id ? genre.color : 'transparent',
                  borderColor: activeGenre === genre.id ? genre.color : undefined,
                }}
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>

        {/* Station list */}
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="p-4 space-y-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/40">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-xs font-mono">SCANNING FREQUENCIES...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#FF003C]">
                <WifiOff className="w-8 h-8 mb-2" />
                <span className="text-xs font-mono">{error}</span>
                <button 
                  onClick={() => fetchStations(activeGenre)}
                  className="mt-2 text-[10px] text-[#00F0FF] hover:underline"
                >
                  RETRY
                </button>
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/40">
                <Radio className="w-8 h-8 mb-2" />
                <span className="text-xs font-mono">NO STATIONS FOUND</span>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredStations.map((station, index) => (
                  <motion.button
                    key={station.stationuuid || index}
                    data-testid={`station-item-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => {
                      onSelectStation(station);
                      onOpenChange(false);
                    }}
                    className={`
                      w-full p-3 rounded text-left transition-all duration-200
                      ${currentStation?.stationuuid === station.stationuuid 
                        ? 'bg-[#00F0FF]/20 border border-[#00F0FF]' 
                        : 'bg-black/30 border border-white/5 hover:border-white/20 hover:bg-white/5'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Station favicon */}
                      <div 
                        className="w-10 h-10 rounded bg-black/50 flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{
                          boxShadow: currentStation?.stationuuid === station.stationuuid 
                            ? '0 0 10px rgba(0, 240, 255, 0.5)' 
                            : 'none'
                        }}
                      >
                        {station.favicon ? (
                          <img 
                            src={station.favicon} 
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <Radio 
                          className="w-5 h-5 text-white/40" 
                          style={{ display: station.favicon ? 'none' : 'block' }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-['Rajdhani'] font-semibold text-white truncate">
                            {station.name}
                          </span>
                          {currentStation?.stationuuid === station.stationuuid && (
                            <Wifi className="w-3 h-3 text-[#39FF14] animate-pulse flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-white/40 truncate">
                            {station.country || 'Unknown'}
                          </span>
                          {station.bitrate > 0 && (
                            <span className="text-[10px] font-mono text-[#00F0FF]/60">
                              {station.bitrate}kbps
                            </span>
                          )}
                        </div>
                        {station.tags && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {station.tags.split(',').slice(0, 3).map((tag, i) => (
                              <span 
                                key={i}
                                className="text-[8px] font-mono px-1 py-0.5 bg-white/5 rounded text-white/40"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* Scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none scanlines opacity-10" />
      </SheetContent>
    </Sheet>
  );
};

export default StationBrowser;
