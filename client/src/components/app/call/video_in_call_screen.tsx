import {
  useState,
  useEffect,
  useRef,
  type FC,
  type JSX,
  type CSSProperties,
  useCallback,
} from "react";
import { useConnProvider } from "@/constants/providers/conn_provider";
import type { Streams, User } from "@/constants/types";
import { useCallProvider } from "@/constants/providers/call_provider";
import ActivityIndicator from "@/components/utility/activity_indicator";
import { proxyImage } from "@/constants/var_2";

interface Props {
  friend: User;
}

const VideoIncallScreen: FC<Props> = ({ friend }): JSX.Element => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [swapped, setSwapped] = useState(false); // toggle between main/popup
  const box = { width: 160, height: 240 }; // popup size
  const offset = { right: 16, bottom: 112 }; // 1rem, 7rem

  const { localStream, remoteStream, isRemoteAudioPaused, isRemoteVideoPaused, isLocalVideoPaused, screenStream, isSharingScreen } = useCallProvider();
  const { user_id, picture } = useConnProvider().user as User;
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Position popup bottom-right
  useEffect(() => {
    if (!containerRef.current) return;
    const { clientHeight, clientWidth } = containerRef.current;

    setPos({
      x: clientWidth - box.width - offset.right,
      y: clientHeight - box.height - offset.bottom,
    });
  }, [
    containerRef.current,
    containerRef.current?.clientWidth,
    containerRef.current?.clientHeight
  ]);

  const movePopup = useCallback((x: number, y: number) => {
    if (!containerRef.current) return;
    const { clientHeight, clientWidth } = containerRef.current;

    setPos({
      x: Math.min(clientWidth - box.width - offset.right, Math.max(0, x)),
      y: Math.min(clientHeight - box.height - offset.bottom, Math.max(0, y)),
    });
  }, [
    containerRef.current,
    containerRef.current?.clientWidth,
    containerRef.current?.clientHeight
  ]);

  const handleMove = (clientX: number, clientY: number) =>
    movePopup(clientX - box.width / 2, clientY - box.height / 2);

  // Decide which local stream to send
  const activeLocalStream = isSharingScreen ? screenStream : localStream;

  // Build the streams array for rendering
  const streams = [remoteStream, activeLocalStream].filter(Boolean) as Streams[];

  // Attach streams to <video> elements
  useEffect(() => {
    streams.forEach((s) => {
      const el = videoRefs.current[s.user_id];
      if (el && s.stream && el.srcObject !== s.stream) {
        el.srcObject = s.stream;
      }
    });
  }, [streams]);

  // Swap videos
  const handleSwap = () => setSwapped((p) => !p);

  const [dpIsLoading, setDpIsLoading] = useState<boolean>(true);


  return (
    <div ref={containerRef} style={{ overflow: "hidden" }} className="mobile_video_in_call_container">
      {streams.map((s) => {
        const isLocal = s.user_id === user_id;
        const isMain = swapped ? isLocal : !isLocal; // determines which is main
        const style: CSSProperties = !isMain
          ? {
            left: pos.x,
            top: pos.y,
            width: box.width,
            height: box.height,
            cursor: "grab",
            position: "absolute",
            zIndex: 2,
            transition: "top 0.05s ease-in-out, left 0.05s ease-in-out",
          }
          : { zIndex: 1 };

        return (
          <div
            key={s.user_id}
            className={isMain ? "main_video_stream_container" : "popup_video_stream_container"}
            style={style}
            onMouseMove={(e) => !isMain && e.buttons === 1 && handleMove(e.clientX, e.clientY)}
            onTouchMove={(e) => !isMain && handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            onClick={(e) => {
              e.stopPropagation();
              if (!isMain) handleSwap(); // tap popup to swap
            }}
          >
            {isLocal && !isLocalVideoPaused && //display local vid normally
              (<video
                ref={(el) => {
                  (videoRefs.current[s.user_id] = el)
                }}
                autoPlay
                playsInline
                muted={isLocal ? true : isRemoteAudioPaused ? true : false}
                className="mobile_video_in_call_video"
              />)
            }
            {!isLocal && !isRemoteVideoPaused && //dispaly remote vid normally
              (<video
                ref={(el) => {
                  (videoRefs.current[s.user_id] = el)
                }}
                autoPlay
                playsInline
                muted={isLocal ? true : isRemoteAudioPaused ? true : false}
                className="mobile_video_in_call_video"
              />)
            }
            {isLocal && isLocalVideoPaused && (
              <div style={{
                background: `url(${picture})`,
              }} className="mobile_video_in_call_local_paused">
                <div className="mobile_in_call_main_is_audio">
                  <div className="mobile_video_in_call_local_paused_user_dp_container">
                    {dpIsLoading &&
                      (<div className="mobile_video_in_call_local_paused_user_dp_is_loading">
                        <ActivityIndicator style="spin" color="var(--app-accent)" />
                      </div>)}
                    <img onLoad={() => setDpIsLoading(false)} src={proxyImage(picture)} className="mobile_video_in_call_local_paused_user_dp" />
                  </div>
                </div>
              </div>
            )}
            {!isLocal && isRemoteVideoPaused && (
              < div style={{
                background: `url(${friend.picture})`,
              }} className="mobile_video_in_call_remote_paused">
                <div className="mobile_in_call_main_is_audio">
                  <div className="mobile_video_in_call_local_paused_user_dp_container">
                    {dpIsLoading &&
                      (<div className="mobile_video_in_call_local_paused_user_dp_is_loading">
                        <ActivityIndicator style="spin" color="var(--app-accent)" />
                      </div>)}
                    <img onLoad={() => setDpIsLoading(false)} src={proxyImage(friend.picture)} className="mobile_video_in_call_local_paused_user_dp" />
                  </div>
                </div>
              </div>
            )
            }

          </div>
        );
      })}
    </div>
  );
};

export default VideoIncallScreen;