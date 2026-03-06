import { Knob } from './Knob';
import { MixerChannel } from './MixerChannel';
import { Crossfader } from './Crossfader';

export const CentralMixer = ({
  deckA,
  deckB,
  crossfade,
  onCrossfadeChange,
  masterVolume,
  onMasterVolumeChange,
  boothVolume,
  onBoothVolumeChange,
  headphoneMix,
  onHeadphoneMixChange,
  headphoneLevel,
  onHeadphoneLevelChange,
}) => {
  return (
    <div 
      className="flex flex-col gap-4 p-4 rounded-xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/10"
      data-testid="central-mixer"
    >
      {/* Top section - Master controls */}
      <div className="flex items-start justify-between gap-4">
        {/* Sound Color FX */}
        <div className="flex flex-col gap-2">
          <span className="text-[8px] font-mono text-white/40 text-center">SOUND COLOR FX</span>
          <div className="flex gap-1">
            {['SPACE', 'FILTER', 'CRUSH', 'NOISE'].map((fx) => (
              <button
                key={fx}
                className="px-2 py-1 text-[7px] font-mono bg-white/10 hover:bg-white/20 rounded text-white/60"
              >
                {fx}
              </button>
            ))}
          </div>
        </div>

        {/* Master + Booth */}
        <div className="flex gap-3">
          <Knob
            label="MASTER"
            value={masterVolume}
            onChange={onMasterVolumeChange}
            min={0}
            max={1}
            size={45}
            color="#FF003C"
            testId="master-volume"
          />
          <Knob
            label="BOOTH"
            value={boothVolume}
            onChange={onBoothVolumeChange}
            min={0}
            max={1}
            size={45}
            color="#FF6600"
            testId="booth-volume"
          />
        </div>
      </div>

      {/* Channel strips */}
      <div className="flex justify-center gap-4">
        <MixerChannel
          deckId="A"
          trim={deckA.volume}
          high={deckA.treble}
          mid={deckA.mid}
          low={deckA.bass}
          color={deckA.filter}
          volume={deckA.volume}
          analyserData={deckA.analyserData}
          isPlaying={deckA.isPlaying}
          onTrimChange={deckA.updateVolume}
          onHighChange={deckA.updateTreble}
          onMidChange={deckA.updateMid}
          onLowChange={deckA.updateBass}
          onColorChange={deckA.updateFilter}
          onVolumeChange={deckA.updateVolume}
        />
        
        <MixerChannel
          deckId="B"
          trim={deckB.volume}
          high={deckB.treble}
          mid={deckB.mid}
          low={deckB.bass}
          color={deckB.filter}
          volume={deckB.volume}
          analyserData={deckB.analyserData}
          isPlaying={deckB.isPlaying}
          onTrimChange={deckB.updateVolume}
          onHighChange={deckB.updateTreble}
          onMidChange={deckB.updateMid}
          onLowChange={deckB.updateBass}
          onColorChange={deckB.updateFilter}
          onVolumeChange={deckB.updateVolume}
        />
      </div>

      {/* Crossfader section */}
      <div className="pt-3 border-t border-white/10">
        <Crossfader
          value={crossfade}
          onChange={onCrossfadeChange}
        />
      </div>

      {/* Headphones section */}
      <div className="flex justify-center gap-4 pt-3 border-t border-white/10">
        <div className="text-center">
          <span className="text-[8px] font-mono text-white/40 block mb-2">HEADPHONES</span>
          <div className="flex gap-3">
            <Knob
              label="MIXING"
              value={headphoneMix}
              onChange={onHeadphoneMixChange}
              min={0}
              max={1}
              size={35}
              color="#00F0FF"
              testId="headphone-mix"
            />
            <Knob
              label="LEVEL"
              value={headphoneLevel}
              onChange={onHeadphoneLevelChange}
              min={0}
              max={1}
              size={35}
              color="#00F0FF"
              testId="headphone-level"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralMixer;
