import { useState, useEffect, useRef, type FC, type JSX } from "react";
import { useConnProvider } from "@/constants/providers/conn_provider";
import { useCallProvider } from "@/constants/providers/call_provider";
import type { CallState } from "@/constants/types";

interface Props {
  localStream: MediaStream;
  remoteStream: MediaStream | null;
}

const VideoIncallScreen: FC<Props> = ({ localStream, remoteStream }): JSX.Element => {
  const { user } = useConnProvider();

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [mainStreamId, setMainStreamId] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const { callState } = useCallProvider();


  const { initiator, receiver } = callState as CallState;
  const { user_id } = user;

  // Build unified stream list
  const streams = [
    localStream ? { user_id: user.user_id, stream: localStream } : null,
    remoteStream ? { user_id: initiator.user_id === user_id ? receiver.user_id : initiator.user_id, stream: remoteStream } : null,
  ].filter(Boolean) as { user_id: string; stream: MediaStream }[];

  // Default main stream
  useEffect(() => {
    if (streams.length === 1) {
      setMainStreamId(streams[0].user_id);
    } else if (streams.length > 1) {
      setMainStreamId(remoteStream ? streams[1].user_id : streams[0].user_id);
    }
  }, [streams.length]);

  // Attach streams to video elements
  useEffect(() => {
    streams.forEach((stream, i) => {
      if (videoRefs.current[i]) {
        videoRefs.current[i]!.srcObject = stream.stream;
      }
    });
  }, [streams]);

  const handleSwap = () => {
    if (streams.length < 2) return;
    const other = streams.find((s) => s.user_id !== mainStreamId);
    if (other) setMainStreamId(other.user_id);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setDragging(true);
    setOffset({
      x: e.clientX - popupPos.x,
      y: e.clientY - popupPos.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    setPopupPos({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    >
      {streams.map((stream, i) => {
        const isMain = stream.user_id === mainStreamId;
        const isPopup = streams.length > 1 && !isMain;

        return (
          <div
            key={stream.user_id}
            onClick={isPopup ? handleSwap : undefined}
            onMouseDown={isPopup ? handleMouseDown : undefined}
            style={{
              position: "absolute",
              width: isPopup ? "25%" : "100%",
              height: isPopup ? "auto" : "100%",
              aspectRatio: isPopup ? "16 / 9" : undefined,
              bottom: isPopup ? popupPos.y : 0,
              right: isPopup ? popupPos.x : 0,
              cursor: isPopup ? "grab" : "default",
              zIndex: isPopup ? 10 : 1,
              borderRadius: isPopup ? "10px" : "0px",
              overflow: "hidden",
              boxShadow: isPopup ? "0 0 10px rgba(0,0,0,0.4)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <video
              ref={(el) => {(videoRefs.current[i] = el)}}
              autoPlay
              playsInline
              muted={stream.user_id === user.user_id}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "black",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default VideoIncallScreen;
