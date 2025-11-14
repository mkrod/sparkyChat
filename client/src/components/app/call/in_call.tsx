import type { CallState, CallStatus, User } from '@/constants/types';
import { useEffect, useState, type FC, type JSX } from 'react';
import "./css/in_call.css";
import AudioIncallScreen from './audio_in_call_screen';
import { SlVolume2 } from 'react-icons/sl';
import { BsMic, BsMicMute } from 'react-icons/bs';
import { MdCallEnd, MdOutlineScreenShare, MdOutlineStopScreenShare } from 'react-icons/md';
import { IoVideocamOffOutline, IoVideocamOutline } from 'react-icons/io5';
import { useChatProvider } from '@/constants/providers/chatProvider';
import VideoIncallScreen from './video_in_call_screen';
import { useCallProvider } from '@/constants/providers/call_provider';
import { formatTime } from '@/constants/var_2';
import { LuSwitchCamera } from 'react-icons/lu';


interface Props {
    friend: User;
}

const QuickFormatText = (text: string) => text.slice(0, 1).toUpperCase() + text.slice(1);
const InCall: FC<Props> = ({ friend }): JSX.Element => {


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
        <div className='in_call_container'>
            <div className="in_call_header_container">
                <div className='in_call_friend_name_container'>
                    <span className='in_call_friend_name'>{friend.name.first}</span>
                    <span className='in_call_friend_name'>{friend.name.last}</span>
                </div>
                <div className='in_call_timelapse_container'>
                    {(elapsedTime && status === "connected") &&  <span className='in_call_timelapse'>{ elapsedTime }</span>}
                    {(!elapsedTime || status !== "connected") && <span className='in_call_timelapse'>{QuickFormatText(getStatus(status)) /*ill format it maybe */}</span>}
                </div>
            </div>


            {callState?.type === "voice" && (<AudioIncallScreen loudSpeaker={loud} data={friend} />)}
            {callState?.type === "video" && (<VideoIncallScreen friend={friend} />)}

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

export default InCall