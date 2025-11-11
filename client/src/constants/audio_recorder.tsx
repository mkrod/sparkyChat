import { useState, useCallback, useEffect, useRef } from "react";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const elapsedInNumber = useRef<number>(0);
  const [elapsed, setElapsed] = useState("00:00");
  const chunksRef = useRef<Blob[]>([]); // ✅ mutable storage for real-time blob

  useEffect(() => {
    if (!isRecording) return;

    const canvas = document.getElementById("audioWaveCanvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const audioCtx = new AudioContext();
    let analyser: AnalyserNode;
    let dataArray: Uint8Array;
    let animationId: number;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      const draw = () => {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = canvas.width / dataArray.length;

        dataArray.forEach((v, i) => {
          const barHeight = (v / 255) * canvas.height;
          ctx.fillStyle = "var(--app-accent)";
          ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
        });
      };
      draw();
    });

    return () => cancelAnimationFrame(animationId);
  }, [isRecording]);

  const startRecorder = useCallback(async () => {
    if (isRecording) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let startTime = Date.now();
    let interval: ReturnType<typeof setInterval>;
    chunksRef.current = []; // reset

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data); // store immediately
      }
    };

    recorder.onstart = () => {
      setElapsed("00:00");
      startTime = Date.now();

      interval = setInterval(() => {
        const diff = Date.now() - startTime;
        elapsedInNumber.current = Math.floor(diff / 1000); // seconds
        const seconds = Math.floor((diff / 1000) % 60);
        const minutes = Math.floor(diff / 60000);
        setElapsed(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }, 1000);
    };

    recorder.onstop = () => {
      clearInterval(interval);
      stream.getTracks().forEach(track => track.stop());
    };

    recorder.start(1000); // ✅ slice every 1s
    setMediaRecorder(recorder);
    setIsRecording(true);
  }, [isRecording]);

  const stopRecorder = useCallback(() => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    setIsRecording(false);
  }, [mediaRecorder]);

  const getAudioBlob = useCallback(() => {
    if (chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { type: "audio/webm" });
  }, []);

  return {
    isRecording,
    elapsedInNumber: elapsedInNumber.current,
    elapsed,
    startRecorder,
    stopRecorder,
    getAudioBlob,
    audioChunks: chunksRef
  };
};
