import { Knob } from './Knob';
import { ChannelFader } from './ChannelFader';
import { VerticalVUMeter } from './VerticalVUMeter';

export const MixerChannel = ({
  deckId = 'A',
  trim,
  high,
  mid,
  low,
  color,
  volume,
  analyserData,
  isPlaying,
  onTrimChange,
  onHighChange,
  onMidChange,
  onLowChange,
  onColorChange,
  onVolumeChange,
  onCue,
  isCued,
}) => {
  const deckColor = deckId === 'A' ? '#00F0FF' : '#FF003C';

  return (
    <div 
      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-black/30 border border-white/10"
      data-testid={`mixer-channel-${deckId.toLowerCase()}`}
    >
      {/* Channel label */}
      <div 
        className="text-[10px] font-['Orbitron'] font-bold tracking-wider"
        style={{ color: deckColor }}
      >
        CH {deckId === 'A' ? '1' : '2'}
      </div>

      {/* TRIM knob */}
      <Knob
        label="TRIM"
        value={trim}
        onChange={onTrimChange}
        min={0}
        max={1.5}
        size={40}
        color="#FFFFFF"
        testId={`trim-${deckId.toLowerCase()}`}
      />

      {/* 3-band EQ */}
      <div className="space-y-1">
        <Knob
          label="HI"
          value={high}
          onChange={onHighChange}
          min={-1}
          max={1}
          size={35}
          color="#FFFFFF"
          testId={`eq-hi-${deckId.toLowerCase()}`}
        />
        <Knob
          label="MID"
          value={mid}
          onChange={onMidChange}
          min={-1}
          max={1}
          size={35}
          color="#FFFFFF"
          testId={`eq-mid-${deckId.toLowerCase()}`}
        />
        <Knob
          label="LOW"
          value={low}
          onChange={onLowChange}
          min={-1}
          max={1}
          size={35}
          color="#FFFFFF"
          testId={`eq-low-${deckId.toLowerCase()}`}
        />
      </div>

      {/* Color FX knob */}
      <Knob
        label="COLOR"
        value={color}
        onChange={onColorChange}
        min={-1}
        max={1}
        size={35}
        color="#FFD700"
        testId={`color-${deckId.toLowerCase()}`}
      />

      {/* VU Meter + Fader row */}
      <div className="flex items-end gap-2">
        <VerticalVUMeter 
          analyserData={analyserData} 
          isPlaying={isPlaying} 
          deckId={deckId}
        />
        <ChannelFader
          value={volume}
          onChange={onVolumeChange}
          deckId={deckId}
        />
      </div>

      {/* CUE button */}
      <button
        onClick={onCue}
        className={`
          w-full py-2 rounded text-[10px] font-bold font-mono
          transition-all duration-150
          ${isCued 
            ? 'bg-[#FF6600] text-white shadow-[0_0_15px_#FF660080]' 
            : 'bg-[#FF6600]/30 text-[#FF6600] hover:bg-[#FF6600]/50'
          }
        `}
        data-testid={`cue-channel-${deckId.toLowerCase()}`}
      >
        CUE
      </button>
    </div>
  );
};

export default MixerChannel;
