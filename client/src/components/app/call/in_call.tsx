import type { CallState, User } from '@/constants/types';
import { type FC, type JSX } from 'react';
import "./css/in_call.css";
import AudioIncallScreen from './audio_in_call_screen';
import { useConnProvider } from '@/constants/providers/conn_provider';
import { SlVolume2 } from 'react-icons/sl';
import { BsMic } from 'react-icons/bs';
import { MdCallEnd } from 'react-icons/md';
import { IoVideocamOutline } from 'react-icons/io5';
import { useChatProvider } from '@/constants/providers/chatProvider';
import VideoIncallScreen from './video_in_call_stream';
import { useCallProvider } from '@/constants/providers/call_provider';


interface Props {
    friend: User;
}

const QuickFormatText = (text: string) => text.slice(0, 1).toUpperCase() + text.slice(1);
const InCall: FC<Props> = ({ friend }): JSX.Element => {


    const { callState, localStream, remoteStream, updateCallState } = useCallProvider();
    const { activeColor } = useChatProvider();
    //const { user } = useConnProvider();
    const timelapse = 0;


    return (
        <div className='in_call_container'>
            <div className="in_call_header_container">
                <div className='in_call_friend_name_container'>
                    <span className='in_call_friend_name'>{friend.name.first}</span>
                    <span className='in_call_friend_name'>{friend.name.last}</span>
                </div>
                <div className='in_call_timelapse_container'>
                    {timelapse > 0 && <span className='in_call_timelapse'>{timelapse /*ill format it maybe */}</span>}
                    {timelapse === 0 && <span className='in_call_timelapse'>{QuickFormatText(callState?.status || "") /*ill format it maybe */}</span>}
                </div>
            </div>


            {callState?.type === "voice" && (<AudioIncallScreen data={friend} />)}
            {callState?.type === "video" && (<VideoIncallScreen localStream={localStream as MediaStream} remoteStream={remoteStream as MediaStream} />)}

            <div className='in_call_bottom_container'>
                <div style={{
                    background: activeColor.fadedBorder,
                    boxShadow: " 0 0 5px " + activeColor.fadeBackground
                }} className="in_call_bottom_button_container">
                    <SlVolume2 size={18} />
                </div>
                <div style={{
                    background: activeColor.fadedBorder,
                    boxShadow: " 0 0 5px " + activeColor.fadeBackground
                }} className="in_call_bottom_button_container">
                    <BsMic size={18} />
                </div>
                {callState?.type === "video" &&
                    (<div style={{
                        background: activeColor.fadedBorder,
                        boxShadow: " 0 0 5px " + activeColor.fadeBackground
                    }} className="in_call_bottom_button_container">
                        <IoVideocamOutline size={18} />
                    </div>)}
                <div
                    style={{
                        background: "red",
                        color: "#eeeeee",
                        boxShadow: " 0 0 5px " + activeColor.fadeBackground,
                    }}
                    className="in_call_bottom_button_container"
                    onClick={() => {
                        updateCallState({ _id: callState?._id||"", status: "ended"})
                    }}
                >
                    <MdCallEnd size={20} />
                </div>
            </div>
        </div>
    )
}

export default InCall