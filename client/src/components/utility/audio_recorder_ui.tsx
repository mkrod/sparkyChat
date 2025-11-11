import { IoIosPause } from 'react-icons/io'
import { RiDeleteBin6Line } from 'react-icons/ri'
import ActivityIndicator from './activity_indicator'
import type { FC, ReactNode } from 'react'
import { PiPaperPlaneTiltFill } from 'react-icons/pi'
import "./css/audio_recorder_ui.css";

interface Props {
    stopRecorder: () => void;
    sending: boolean;
    send: () => void;
    elapsed: string;
}
const AudioRecorderUi: FC<Props> = ({
    stopRecorder,
    sending,
    send,
    elapsed
}): ReactNode => {
    return (
        <div className="audio_recorder_container">
            <div className="audio_recorder_top">
                <span className='audio_recorder_elapse_time'>{ elapsed }</span>
                <div className='audio_recorder_waves'>
                    <canvas id="audioWaveCanvas"></canvas>
                </div>
            </div>
            <div className="audio_recorder_bottom">
                <div title='Delete' className="in_chat_header_icon" onClick={stopRecorder}>
                    <RiDeleteBin6Line size={20} />
                </div>
                <div title='Pause' className="in_chat_header_icon" onClick={stopRecorder}>
                    <IoIosPause size={20} color='red' />
                </div>
                <div title='Record' className="in_chat_header_icon" onClick={send}>
                    {!sending && <PiPaperPlaneTiltFill size={20} color='var(--app-accent)' />}
                    {sending && <ActivityIndicator size='small' style='spin' />}
                </div>
            </div>
        </div>
    )
}

export default AudioRecorderUi