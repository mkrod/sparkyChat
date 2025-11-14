import type { Message, User } from '@/constants/types';
import React, { useState, useEffect, type RefObject, useRef } from 'react';
import "./css/msg_in.css";
import { formatFileSize, getTimeFromDate } from '@/constants/vars';
import { MdDownload } from 'react-icons/md';
import ActivityIndicator from '@/components/utility/activity_indicator';
import { get, set } from 'idb-keyval';
import { useConnProvider } from '@/constants/providers/conn_provider';
import socket from '@/constants/socket.io/socket_conn';
import { VscFileSymlinkFile } from 'react-icons/vsc';
import { proxyImage } from '@/constants/var_2';
import ImageViewer from '@/components/utility/viewable_image';
import VideoViewer from '@/components/utility/video_viewer';
import AudioPlayer from '@/components/utility/audio_player';

interface Prop {
    stack: boolean;
    friendData: User; //didnt use it, can remove
    message: Message;
    parentContainer?: RefObject<HTMLDivElement | null>;
}

const MsgIn: React.FC<Prop> = ({ stack, message, parentContainer, friendData }): React.JSX.Element => {

    const { user } = useConnProvider()
    const [loading, setLoading] = useState<boolean>(false);
    const [mediaLoaded, setMediaLoaded] = useState<boolean>(false);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const bubbleContainer = useRef<HTMLDivElement | null>(null)

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

    }, [message]);

    const download = async () => {
        if (!message.media?.content) return;

        setLoading(true);
        try {
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



    useEffect(() => {
        if (!message || !parentContainer?.current || !bubbleContainer?.current) return;
        if (!user.privacy.read_receipt) return;
        if (message.status === "read") return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        console.log(`${message?.chatId} with content ${message?.content} is intersecting`);
                        // Example: send socket event or mark message as "read"
                        // socket.emit("mark_read", message.id);
                        const payload = {
                            sender_id: user.user_id,
                            receiver_id: friendData?.user_id,
                            message_id: message?.chatId
                        }
                        socket.emit("mark_read", payload);
                    }
                });
            },
            {
                root: parentContainer.current,
                threshold: 0.1,
            }
        );

        observer.observe(bubbleContainer.current);

        return () => observer.disconnect();
    }, [message, parentContainer?.current, bubbleContainer.current, user.privacy?.read_receipt]);


    switch (message.type) {
        case "image":
            return (
                <div ref={bubbleContainer} style={{ marginTop: stack ? 20 : 0 }} className='msg_in_container'>
                    <div className="msg_in_image_container">
                        {!mediaLoaded && (
                            <div className="msg_in_image_placeholder">
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
                    <div className="msg_in_chat_meta_container">
                        <span className='msg_in_chat_meta_time'>{getTimeFromDate(message.timestamp)}</span>
                    </div>
                </div>
            );
        case "file":
            return (
                <div ref={bubbleContainer} style={{ marginTop: stack ? 20 : 0 }} className='msg_in_container'>
                    <div className="msg_in_file_container">
                        <div className='msg_in_file_icon_container'>
                            <VscFileSymlinkFile />
                        </div>
                        <a href={proxyImage(message.media?.content || "")} download className='msg_in_file_name'>{message.media?.originalName}</a>
                    </div>
                    <div className='msg_in_chat_msg_container'>{message.media?.caption}</div>
                    <div className="msg_in_chat_meta_container">
                        <span className='msg_in_chat_meta_time'>{getTimeFromDate(message.timestamp)}</span>
                        <span className='msg_in_chat_meta_size'>{formatFileSize(message.media?.size || 0)}</span>
                    </div>
                </div>
            )
        case "video":
            return (
                <div ref={bubbleContainer} style={{ marginTop: stack ? 20 : 0 }} className='msg_in_container'>
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
                    <div className="msg_in_chat_meta_container">
                        <span className='msg_in_chat_meta_time'>{getTimeFromDate(message.timestamp)}</span>
                    </div>
                </div>
            );
        case "audio":
            return (
                <div ref={bubbleContainer} style={{ marginTop: stack ? 20 : 0, minWidth: "80%", minHeight: "fit-content" }} className='msg_in_container'>
                    <AudioPlayer
                        message={message}
                        friendDp={friendData.picture}
                    />
                </div>
            );
        default:
            return (
                <div ref={bubbleContainer} style={{ marginTop: stack ? 20 : 0 }} className='msg_in_container'>
                    <div className='msg_in_chat_msg_container'>{message.content}</div>
                    <div className="msg_in_chat_meta_container">
                        <span className='msg_in_chat_meta_time'>{getTimeFromDate(message.timestamp)}</span>
                    </div>
                </div>
            )
    }
}

export default MsgIn;
