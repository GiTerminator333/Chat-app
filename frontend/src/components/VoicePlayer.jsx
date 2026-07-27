import { useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon } from "lucide-react";

const BAR_COUNT = 30;

/**
 * Generate a stable waveform shape from a message ID string.
 * Same msgId → same bar pattern every time (not random on each render).
 */
function seededBars(seed) {
  const bars = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  for (let i = 0; i < BAR_COUNT; i++) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    bars.push(0.15 + (hash % 100) / 117); // heights 0.15 – 1.0
  }
  return bars;
}

/**
 * VoicePlayer — WhatsApp-style voice note playback widget.
 *
 * Props:
 *   audioUrl   — Cloudinary URL of the audio file
 *   msgId      — message _id used to seed the waveform shape
 *   isSentByMe — controls colour theme (cyan vs slate)
 */
function VoicePlayer({ audioUrl, msgId, isSentByMe }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);       // 0–1
  const [duration, setDuration] = useState(null);    // null = not yet known
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const waveformBars = useRef(seededBars(msgId || "default")).current;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = audioUrl;
    audioRef.current = audio;

    // Some browsers (Chrome) mark .webm streams as Infinity until fully loaded.
    // We listen for both loadedmetadata and durationchange.
    const handleDuration = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    audio.addEventListener("loadedmetadata", handleDuration);
    audio.addEventListener("durationchange", handleDuration);

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      const dur = audio.duration;
      if (dur && isFinite(dur) && dur > 0) {
        setProgress(audio.currentTime / dur);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("loadedmetadata", handleDuration);
      audio.removeEventListener("durationchange", handleDuration);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying((p) => !p);
  };

  // Seek to a bar position when clicked
  const handleBarClick = (index) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (index / BAR_COUNT) * duration;
  };

  // Safe formatter — never shows NaN or Infinity
  const formatTime = (s) => {
    if (!s || !isFinite(s) || isNaN(s)) return "0:00";
    const secs = Math.floor(s);
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  };

  // What to show in the time label
  const timeLabel = isPlaying || currentTime > 0
    ? formatTime(currentTime)
    : formatTime(duration);

  const playedColor  = isSentByMe ? "bg-white/80" : "bg-cyan-400";
  const unplayedColor = isSentByMe ? "bg-white/30" : "bg-slate-500";

  return (
    <div className="flex items-center gap-3 min-w-[220px] max-w-[300px]">
      {/* Play / Pause */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105 ${
          isSentByMe
            ? "bg-white/20 hover:bg-white/30 text-white"
            : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
        }`}
      >
        {isPlaying
          ? <PauseIcon className="w-4 h-4" />
          : <PlayIcon className="w-4 h-4 ml-0.5" />
        }
      </button>

      {/* Waveform bars */}
      <div className="flex items-center gap-[2px] flex-1 h-8">
        {waveformBars.map((height, i) => {
          const isPlayed = i / BAR_COUNT < progress;
          const isCurrent = Math.floor(progress * BAR_COUNT) === i;
          return (
            <div
              key={i}
              onClick={() => handleBarClick(i)}
              className={`flex-1 rounded-full cursor-pointer transition-colors duration-100 ${
                isPlayed ? playedColor : unplayedColor
              } ${isCurrent && isPlaying ? "opacity-100" : ""}`}
              style={{ height: `${Math.round(height * 100)}%` }}
            />
          );
        })}
      </div>

      {/* Time label */}
      <span className={`text-[11px] font-mono tabular-nums shrink-0 ${
        isSentByMe ? "text-white/70" : "text-slate-400"
      }`}>
        {timeLabel}
      </span>
    </div>
  );
}

export default VoicePlayer;
