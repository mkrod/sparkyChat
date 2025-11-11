
import type { Message } from '@/constants/types';
import React, { useEffect, useState } from 'react'
import "./css/msg_out.css";
import { formatFileSize, getTimeFromDate, statusIcon } from '@/constants/vars';
import ActivityIndicator from '@/components/utility/activity_indicator';
import { MdDownload } from 'react-icons/md';
import { get, set } from 'idb-keyval';
import { VscFileSymlinkFile } from 'react-icons/vsc';
import { proxyImage } from '@/constants/var_2';
import ImageViewer from '@/components/utility/viewable_image';
import VideoViewer from '@/components/utility/video_viewer';
import AudioPlayer from '@/components/utility/audio_player';

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
                        {/*mediaLoaded && <img src={blobUrl || message.media?.content} className='msg_in_image' />*/}
                        {mediaLoaded && (
                            <ImageViewer
                                src={blobUrl || message.media?.content || ""}
                                options={{
                                    thumbnailClassName: "msg_in_image",
                                }}
                                caption={message.media?.caption || ""}
                            />
                        )}
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
                    <div className="msg_out_chat_meta_container">
                        <span className='msg_out_chat_meta_time'>{getTimeFromDate(message.timestamp)}</span>
                        <div className='msg_out_chat_meta_receipt'>
                            {statusIcon[message.status]}
                        </div>
                    </div>
                </div>
            );
        case "file":
            return (
                <div style={{ marginTop: stack ? 20 : 0 }} className='msg_out_container'>
                    <div className="msg_in_file_container">
                        <div className='msg_in_file_icon_container'>
                            <VscFileSymlinkFile color='#ececec' />
                        </div>
                        <a style={{ color: "#ececec" }} href={proxyImage(message.media?.content || "")} download className='msg_in_file_name'>{message.media?.originalName}</a>
                    </div>
                    <div className='msg_in_chat_msg_container'>{message.media?.caption}</div>
                    <div className="msg_in_chat_meta_container">
                        <span className='msg_out_chat_meta_size'>{formatFileSize(message.media?.size || 0)}</span>
                        <span className='msg_out_chat_meta_time'>{getTimeFromDate(message.timestamp)}</span>
                        <div className='msg_out_chat_meta_receipt'>
                            {statusIcon[message.status]}
                        </div>
                    </div>
                </div>
            )
        case "video":
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
                        {/*mediaLoaded && <img src={blobUrl || message.media?.content} className='msg_in_image' />*/}
                        {mediaLoaded && (
                            <VideoViewer
                                src={blobUrl || message.media?.content || ""}
                                poster={message.media?.thumbnail}
                                options={{
                                    thumbnailClassName: "msg_in_image",
                                }}
                                caption={message.media?.caption || ""}
                            />
                        )}
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
                    <div className="msg_out_chat_meta_container">
                        <span className='msg_out_chat_meta_time'>{getTimeFromDate(message.timestamp)}</span>
                        <div className='msg_out_chat_meta_receipt'>
                            {statusIcon[message.status]}
                        </div>
                    </div>
                </div>
            );
        case "audio":
            return (
                <div style={{ marginTop: stack ? 20 : 0, minWidth: "80%", minHeight: "fit-content" }} className='msg_out_container'>
                    <AudioPlayer 
                    message={message}
                    />
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