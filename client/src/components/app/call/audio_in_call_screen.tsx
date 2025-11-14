import type { User } from '@/constants/types'
import { useEffect, useRef, useState, type FC, type JSX } from 'react'
import "./css/in_call.css";
import ActivityIndicator from '@/components/utility/activity_indicator';
import { proxyImage } from '@/constants/var_2';
import { useCallProvider } from '@/constants/providers/call_provider';
import { useChatProvider } from '@/constants/providers/chatProvider';

interface Prop {
    data: User;
    loudSpeaker: boolean;
}
const AudioIncallScreen: FC<Prop> = ({ loudSpeaker, data }): JSX.Element => {

    const { setPrompt } = useChatProvider()
    const { picture } = data;
    const [dpIsLoading, setDpIsLoading] = useState<boolean>(true);
    const { remoteStream } = useCallProvider();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!remoteStream?.stream) return;

        // attach stream to audio element
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.autoplay = true;
        }

        audioRef.current.srcObject = remoteStream.stream;

        // play (some browsers require user interaction)
        audioRef.current.play().catch(() => {
            setPrompt({
                type: "error",
                title: "Audio play prevented by browser",
                body: "requires user interaction, please tap anywhere on your screen"
            });
        });
    }, [remoteStream, audioRef.current]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.volume = loudSpeaker ? 1 : 0.25;
    }, [loudSpeaker, audioRef.current])

    return (
        <div style={{
            background: `url(${picture})`,
        }} className="mobile_in_call_main_is_audio">
            <div className="mobile_in_call_main_is_audio">
                <div className="mobile_in_call_main_is_audio_user_dp_container">
                    {dpIsLoading &&
                        (<div className="mobile_in_call_main_is_audio_user_dp_is_loading">
                            <ActivityIndicator style="spin" color="var(--app-accent)" />
                        </div>)}
                    <img onLoad={() => setDpIsLoading(false)} src={proxyImage(picture)} className="mobile_in_call_main_is_audio_user_dp" />
                    <audio ref={audioRef} style={{ opacity: "0", scale: "0" }} />
                </div>
            </div>

        </div>
    )
}

export default AudioIncallScreen