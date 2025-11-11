import type { UpdateCallStatusPayload, User } from '@/constants/types'
import { useState, type FC, type JSX } from 'react'
import { IoCall } from 'react-icons/io5';
import { MdCallEnd } from 'react-icons/md';
import "./css/ringing.css"
import { proxyImage } from '@/constants/var_2';
import { defaultDp } from '@/constants';
import ActivityIndicator from '@/components/utility/activity_indicator';
import { useChatProvider } from '@/constants/providers/chatProvider';
import { useCallProvider } from '@/constants/providers/call_provider';

interface Props {
    initiator: User;
}

const Ringing: FC<Props> = ({ initiator }): JSX.Element => {

    const [dpIsLoading, setDpIsLoading] = useState<boolean>(true);
    const { activeColor } = useChatProvider();
    const { callState, updateCallState, acceptCall } = useCallProvider();

    return (
        <div className='ringing_container'>
            <div
                style={{
                    borderColor: activeColor.fadedBorder
                }} className='ringing_caller_picture_container'
            >
                {dpIsLoading && <div
                    style={{
                        background: activeColor.fadeBackground
                    }}
                    className='ringing_caller_picture_is_loading'
                >
                    <ActivityIndicator style='spin' color='var(--app-accent)' />
                </div>}
                <img
                    onLoad={() => setDpIsLoading(false)}
                    src={proxyImage(initiator.picture || defaultDp)}
                    className='ringing_caller_picture'
                />
            </div>
            <div style={{
                color: activeColor.textFade
            }} className='ringing_caller_names_container'>
                <span className='ringing_caller_name'>{initiator.name.first}</span>
                <span className='ringing_caller_name'>{initiator.name.last}</span>
            </div>
            <span className='ringing_mid_text'>is now calling...</span>
            <div className="ringing_buttons_container">
                <button onClick={() => {
                    const payload: UpdateCallStatusPayload = {
                        status: "rejected",
                        _id: callState?._id||""
                    }
                    updateCallState(payload);
                }} className="ringing_button decline">
                    <MdCallEnd size={20} />
                    Reject
                </button>
                <button onClick={acceptCall} className="ringing_button accept">
                    <IoCall size={15} />
                    Accept
                </button>
            </div>
        </div>
    )
}

export default Ringing