import type { User } from '@/constants/types'
import { useState, type FC, type JSX } from 'react'
import "./css/in_call.css";
import { useChatProvider } from '@/constants/providers/chatProvider';
import { defaultDp } from '@/constants';
import ActivityIndicator from '@/components/utility/activity_indicator';
import { proxyImage } from '@/constants/var_2';

interface Prop {
    data: User;
}
const AudioIncallScreen: FC<Prop> = ({ data }): JSX.Element => {

    const { activeColor } = useChatProvider();
    const { picture } = data;
    const [dpIsLoading, setDpIsLoading] = useState<boolean>(true);

    return (
        <div style={{
            //background: activeColor.background
        }} className='a_in_call_screen'>
            <div className='a_in_call_friend_picture_container'>
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
                    src={proxyImage(data.picture || defaultDp)}
                    className='a_in_call_friend_picture'
                />
            </div>
        </div>
    )
}

export default AudioIncallScreen