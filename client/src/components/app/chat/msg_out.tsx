
import type { Message } from '@/constants/types';
import React, { useEffect, useState } from 'react'
import "./css/msg_out.css";
import { formatFileSize, getTimeFromDate, statusIcon } from '@/constants/vars';
import ActivityIndicator from '@/components/utility/activity_indicator';
import { MdDownload } from 'react-icons/md';
import { get, set } from 'idb-keyval';

interface Prop {
    stack: boolean;
    message: Message;
}
const MsgOut: React.FC<Prop> = ({ stack, message }): React.JSX.Element => {

    const [loading, setLoading] = useState<boolean>(false);
    const [mediaLoaded, setMediaLoaded] = useState<boolean>(false);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        // Check if media already cached
        if (message.media?.content) {
            get(message.media.content).then((cached: Blob | undefined) => {
                if (cached) {
                    const url = URL.createObjectURL(cached);
                    setBlobUrl(url);
                    setMediaLoaded(true);
                }
            });
        }
    }, [message.media]);

    const download = async () => {
        if (!message.media?.content) return;

        setLoading(true);
        try {
            // Check cache first
            let blob = await get(message.media.content);
            if (!blob) {
                const res = await fetch(message.media.content);
                blob = await res.blob();
                await set(message.media.content, blob); // persist in IndexedDB
            }

            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
            setMediaLoaded(true);
        } catch (err) {
            console.error("Media download error:", err);
        } finally {
            setLoading(false);
        }
    }

    switch (message.type) {
        case "image":
            return (
                <div style={{ marginTop: stack ? 20 : 0 }} className='msg_out_container'>
                    <div className="msg_in_image_container">
                        {!mediaLoaded && (
                            <div
                                className="msg_in_image_placeholder"
                            >
                                <MdDownload size={24} color='var(--app-accent)' onClick={download} />
                            </div>
                        )}
                        {mediaLoaded && <img src={blobUrl || message.media?.content} className='msg_in_image' />}

                        {loading && (
                            <div className="msg_in_loading_container">
                                <ActivityIndicator style='spin' size='small' />
                            </div>
                        )}

                        {!mediaLoaded && (
                            <div className="msg_in_size_container">
                                {formatFileSize(message.media?.size || 0)}
                            </div>
                        )}
                    </div>
                    <div className='msg_in_chat_msg_container'>{message.media?.caption}</div>
                    <div className="msg_in_chat_meta_container">
                        <span className='msg_in_chat_meta_time'>{getTimeFromDate(message.timestamp)}</span>
                    </div>
                </div>
            );


        default:
            return (
                <div style={{ marginTop: stack ? 20 : 0 }} className='msg_out_container'>
                    <div className='msg_out_chat_msg_container'>{message.content}</div>
                    <div className="msg_out_chat_meta_container">
                        <span className='msg_out_chat_meta_time'>{getTimeFromDate(message.timestamp)}</span>
                        <div className='msg_out_chat_meta_receipt'>
                            {statusIcon[message.status]}
                        </div>
                    </div>
                </div>
            )
    }
}

export default MsgOut