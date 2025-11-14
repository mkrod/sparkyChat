import { useEffect, useState, type FC, type ReactNode } from "react"
import "./css/mobile_in_call.css"
import type { CallState, CallStatus, User } from "@/constants/types"
import { FaAngleLeft } from "react-icons/fa6";
import { BsMic, BsMicMute, BsThreeDotsVertical } from "react-icons/bs";
import { SlVolume2 } from "react-icons/sl";
import { IoVideocamOffOutline, IoVideocamOutline } from "react-icons/io5";
import { MdCallEnd, MdOutlineScreenShare, MdOutlineStopScreenShare } from "react-icons/md";
import { useCallProvider } from "@/constants/providers/call_provider";
import AudioIncallScreen from "./audio_in_call_screen";
import MobileVideoInCallScreen from "./mobile_video_incall_screen";
import { formatTime } from "@/constants/var_2";
import { useChatProvider } from "@/constants/providers/chatProvider";
import { LuSwitchCamera } from "react-icons/lu";

interface Props {
    friend: User;
}


const QuickFormatText = (text: string) => text.slice(0, 1).toUpperCase() + text.slice(1);
const MobileInCall: FC<Props> = ({ friend }): ReactNode => {

    const { isMobile } = useChatProvider();
    const { callState, updateCallState, isLocalAudioPaused, isLocalVideoPaused, toggleMic, toggleVideo, isSharingScreen, toggleShareScreen, switchCamera } = useCallProvider();
    const { type, lastActivityAt, status } = callState as CallState;
    const [elapsedTime, setElapsedTime] = useState<string | undefined>(undefined);


    useEffect(() => {
        const interval = setInterval(() => {
            const diff = Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / 1000);

            setElapsedTime(formatTime(diff));
        }, 1000)

        return () => clearInterval(interval);
    }, [callState])


    const getStatus = (status: CallStatus) => status === "initiated" ? "calling" : status;

    const [loud, setLoud] = useState<boolean>(false);


    return (
        <div className="mobile_in_call_container">
            <div className="mobile_in_call_header">
                <div className="mobile_in_call_header_left">
                    <div className="mobile_in_call_header_icon">
                        <FaAngleLeft size={20} />
                    </div>
                </div>
                <div className="mobile_in_call_header_center">
                    <div className="mobile_in_call_header_center_text">{friend.name.first + " " + friend.name.last}</div>
                    {(!elapsedTime || status !== "connected") && <div style={{ fontWeight: "600" }} className="mobile_in_call_header_center_text">{QuickFormatText(getStatus(status))}</div>}
                    {(elapsedTime && status === "connected") && <div style={{ fontWeight: "600" }} className="mobile_in_call_header_center_text">{elapsedTime}</div>}
                </div>
                <div className="mobile_in_call_header_right">
                    <div className="mobile_in_call_header_icon">
                        <BsThreeDotsVertical size={20} />
                    </div>
                </div>
            </div>

            <div className="mobile_in_call_main">
                {type === "voice" && <AudioIncallScreen loudSpeaker={loud} data={friend} />}
                {type === "video" && <MobileVideoInCallScreen friend={friend} />}
            </div>


            <div className="mobile_in_call_footer">
                {type === "voice" && (
                    <div onClick={() => setLoud((prev) => !prev)} style={{ background: loud ? "var(--app-accent)" : "" }} className="mobile_in_call_footer_icon">
                        <SlVolume2 size={20} />
                    </div>
                )}
                <div style={{ background: isLocalAudioPaused ? "var(--app-accent)" : "" }} onClick={toggleMic} className="mobile_in_call_footer_icon">
                    {!isLocalAudioPaused && <BsMic size={20} />}
                    {isLocalAudioPaused && <BsMicMute size={20} />}
                </div>
                {type === "video" && (
                    <div style={{ background: isLocalVideoPaused ? "var(--app-accent)" : "" }} onClick={toggleVideo} className="mobile_in_call_footer_icon">
                        {!isLocalVideoPaused && <IoVideocamOutline size={20} />}
                        {isLocalVideoPaused && <IoVideocamOffOutline size={20} />}
                    </div>
                )}
                {!isMobile && type === "video" && (
                    <div style={{ background: isSharingScreen ? "var(--app-accent)" : "" }} onClick={toggleShareScreen} className="mobile_in_call_footer_icon">
                        {!isSharingScreen && <MdOutlineScreenShare size={20} />}
                        {isSharingScreen && <MdOutlineStopScreenShare size={20} />}
                    </div>
                )}
                {type === "video" && (
                    <div onClick={switchCamera} className="mobile_in_call_footer_icon">
                        <LuSwitchCamera size={20} />
                    </div>
                )}
                <div onClick={() => {
                    updateCallState({ _id: callState?._id || "", status: "ended" })
                }} style={{ backgroundColor: "red", color: "#fff" }} className="mobile_in_call_footer_icon">
                    <MdCallEnd size={20} />
                </div>
            </div>
        </div>
    )
}

export default MobileInCall