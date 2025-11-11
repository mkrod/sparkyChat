import { useState, useEffect, useRef, type FC, type ReactNode } from "react";
import "./css/audio_player.css";
import { FaPause, FaPlay } from "react-icons/fa6";
import { getTimeFromDate, statusIcon } from "@/constants/vars";
import type { Message } from "@/constants/types";
import ActivityIndicator from "./activity_indicator";
import { IoMdMic } from "react-icons/io";
import { serverURL } from "@/constants";
import { useConnProvider } from "@/constants/providers/conn_provider";

interface Props {
  message: Message;
  friendDp?: string;
}

const AudioPlayer: FC<Props> = ({ message, friendDp }): ReactNode => {
  const [playingState, setPlayingState] = useState<"playing" | "paused">("paused");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [elapsed, setElapsed] = useState<string>("00:00");
  const { user } = useConnProvider();

  const duration:number = message.media?.duration||0;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(message.media?.content);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setIsLoading(false);
    });

    audio.addEventListener("timeupdate", () => {
      setProgress((audio.currentTime / duration) * 100);
      setElapsed(formatTime(audio.currentTime));
    });

    audio.addEventListener("ended", () => {
      setPlayingState("paused");
      setProgress(100);
    });

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [message.media?.content]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingState === "paused") {
      audio.play();
      setPlayingState("playing");
    } else {
      audio.pause();
      setPlayingState("paused");
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(1, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="audio_player_container">
      <div className="audio_player_left" onClick={togglePlay}>
        {!isLoading && (
          <div className="audio_player_control_icons">
            {playingState === "paused" && <FaPlay size={22} />}
            {playingState === "playing" && <FaPause size={22} />}
          </div>
        )}
        {isLoading && (
          <div className="audio_player_left_is_loading">
            <ActivityIndicator style="spin" color="#a7a7a7" />
          </div>
        )}
      </div>

      <div className="audio_player_center">
        <div className="audio_player_controls_track_container">
          <input
            min={0}
            max={100}
            step={1}
            value={progress}
            onChange={handleSeek}
            type="range"
            className="audio_player_controls_track"
          />
        </div>
        <div className="audio_player_controls_meta_container">
          <span className="audio_player_controls_meta elapsed">{playingState === "playing" ? elapsed : formatTime(duration)}</span>
          {!friendDp && (
            <div className="audio_player_controls_meta">
              <span className="audio_player_controls_meta timestamp">
                {getTimeFromDate(message.timestamp)}
              </span>
              <div className="msg_out_chat_meta_receipt">{statusIcon[message.status]}</div>
            </div>
          )}
        </div>
      </div>

      <div className="audio_player_right">
        <div className="audio_player_right_dp_container">
          <img
            src={`${serverURL}/proxy?url=${encodeURIComponent(friendDp || user.picture)}`}
            className="audio_player_right_dp"
          />
          <div className="audio_player_right_mic_icon">
            <IoMdMic size={22} color="white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
