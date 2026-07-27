import { useEffect, useRef, useState } from "react";
import { Trash2Icon, SendIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const BAR_COUNT = 24;

/**
 * VoiceRecorder — records audio from the mic, shows live animated bars,
 * and sends the voice note when done.
 *
 * Props:
 *   onCancel — called when user discards the recording
 *   onSent   — called after voice note is sent, so parent can close this UI
 */
function VoiceRecorder({ onCancel, onSent }) {
  const { sendMessage } = useChatStore();

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [bars, setBars] = useState(Array(BAR_COUNT).fill(0.15));

  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const animFrameRef     = useRef(null);
  const timerRef         = useRef(null);
  const streamRef        = useRef(null);
  const audioCtxRef      = useRef(null); // ← must store so we can close it

  // Start recording immediately on mount
  useEffect(() => {
    startRecording();
    return () => cleanupAll(); // always release mic on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // AudioContext for live bar visualisation — stored in ref so we can close it
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const source   = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      // Pick the best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current   = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start(); // buffer internally — one clean chunk on stop
      setIsRecording(true);

      // Timer: count up every second
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

      // Animation loop: read frequency data → update bars
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const drawBars = () => {
        analyser.getByteFrequencyData(dataArray);
        const step    = Math.floor(dataArray.length / BAR_COUNT);
        const newBars = Array.from({ length: BAR_COUNT }, (_, i) => {
          const raw = dataArray[i * step] / 255;
          return Math.max(0.08, raw);
        });
        setBars(newBars);
        animFrameRef.current = requestAnimationFrame(drawBars);
      };
      drawBars();
    } catch {
      alert("Microphone access denied. Please allow microphone permission.");
      onCancel();
    }
  };

  /**
   * Release ALL browser resources that keep the mic active:
   *   1. Cancel the animation frame loop
   *   2. Clear the timer
   *   3. Stop every mic track on the MediaStream
   *   4. Close the AudioContext (this is what actually turns off the red dot)
   */
  const cleanupAll = () => {
    cancelAnimationFrame(animFrameRef.current);
    clearInterval(timerRef.current);

    // Stop mic tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Close AudioContext — this releases the mic at the OS level
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    setIsRecording(false);
  };

  const handleSend = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    // onstop fires once all buffered chunks are flushed
    recorder.onstop = () => {
      cleanupAll(); // release mic immediately after stop
      const blob   = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = () => {
        sendMessage({ voice: reader.result });
        onSent(); // tell MessageInput to close the recorder UI
      };
      reader.readAsDataURL(blob);
    };

    recorder.requestData(); // flush any still-buffered audio before stopping
    recorder.stop();        // triggers onstop above
  };

  const handleCancel = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    cleanupAll();
    onCancel();
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-3 flex-1 bg-slate-800/60 border border-red-500/30 rounded-xl px-4 py-2.5">
      {/* Discard button */}
      <button
        type="button"
        onClick={handleCancel}
        className="text-slate-400 hover:text-red-400 transition-colors shrink-0"
        title="Cancel recording"
      >
        <Trash2Icon className="w-5 h-5" />
      </button>

      {/* Pulsing dot + timer */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 voice-recording-dot" />
        <span className="text-red-400 text-sm font-mono tabular-nums w-8">
          {formatTime(seconds)}
        </span>
      </div>

      {/* Live animated bars */}
      <div className="flex items-center gap-[2px] flex-1 h-9 overflow-hidden">
        {bars.map((height, i) => (
          <div
            key={i}
            className="flex-1 rounded-full bg-red-400 origin-center transition-transform duration-75"
            style={{ height: "100%", transform: `scaleY(${isRecording ? height : 0.1})` }}
          />
        ))}
      </div>

      {/* Send button */}
      <button
        type="button"
        onClick={handleSend}
        className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white flex items-center justify-center hover:from-cyan-600 hover:to-cyan-700 transition-all shrink-0 shadow-md"
        title="Send voice message"
      >
        <SendIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export default VoiceRecorder;
