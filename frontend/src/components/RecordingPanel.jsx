import { Circle, Download, Trash2, Play, Square, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

export const RecordingPanel = ({
  isRecording,
  recordingDuration,
  recordedBlob,
  recordingUrl,
  onStartRecording,
  onStopRecording,
  onDownload,
  onClear,
  formatDuration,
}) => {
  return (
    <div 
      className="cyber-panel p-4"
      data-testid="recording-panel"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-[#FF003C]" />
          <span className="text-xs font-['Orbitron'] tracking-widest text-white/70">
            RECORD MIX
          </span>
        </div>
        {isRecording && (
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-[#FF003C]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm font-mono text-[#FF003C]">
              {formatDuration(recordingDuration)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            data-testid="start-recording-btn"
            onClick={onStartRecording}
            variant="outline"
            className="flex-1 bg-[#FF003C]/10 border-[#FF003C]/30 hover:bg-[#FF003C]/20 hover:border-[#FF003C] text-[#FF003C]"
          >
            <Circle className="w-4 h-4 mr-2 fill-current" />
            START RECORDING
          </Button>
        ) : (
          <Button
            data-testid="stop-recording-btn"
            onClick={onStopRecording}
            variant="outline"
            className="flex-1 bg-white/10 border-white/30 hover:bg-white/20 text-white"
          >
            <Square className="w-4 h-4 mr-2 fill-current" />
            STOP
          </Button>
        )}
      </div>

      {/* Recorded audio preview */}
      {recordedBlob && recordingUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded bg-black/30 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-white/50">RECORDED MIX</span>
            <span className="text-[10px] font-mono text-[#39FF14]">
              {(recordedBlob.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          
          <audio 
            src={recordingUrl} 
            controls 
            className="w-full h-8 mb-3"
            style={{ filter: 'hue-rotate(180deg) saturate(2)' }}
          />
          
          <div className="flex gap-2">
            <Button
              data-testid="download-recording-btn"
              onClick={onDownload}
              variant="outline"
              size="sm"
              className="flex-1 bg-[#39FF14]/10 border-[#39FF14]/30 hover:bg-[#39FF14]/20 hover:border-[#39FF14] text-[#39FF14]"
            >
              <Download className="w-3 h-3 mr-1" />
              DOWNLOAD
            </Button>
            <Button
              data-testid="clear-recording-btn"
              onClick={onClear}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/20 hover:bg-white/10 text-white/60"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <p className="mt-3 text-[9px] font-mono text-white/30 text-center">
        {isRecording 
          ? 'Recording your mix... Click STOP when done'
          : 'Click to record audio playing through your browser'}
      </p>
    </div>
  );
};

export default RecordingPanel;
