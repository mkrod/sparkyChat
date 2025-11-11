import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HiOutlineDownload } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import "./css/video_viewer.css";
import "./css/viewable_image.css";
import { FaPlay } from 'react-icons/fa6';

interface VideoViewerProps {
    src: string;
    caption?: string;
    poster?: string;
    onload?: () => void;
    options?: {
        thumbnailClassName?: string;
        width?: string | number;
        height?: string | number;
        rounded?: boolean;
    };
}

const VideoViewer: React.FC<VideoViewerProps> = ({
    src,
    caption,
    poster,
    onload,
    options = {},
}) => {
    const { thumbnailClassName, width = '100%', height = 'auto', rounded = false } = options;
    const [isOpen, setIsOpen] = useState(false);
    const [fullCaption, setFullCaption] = useState(false);
    const [displayedCaption, setDisplayedCaption] = useState('');
    const captionShortLen = 20;
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (!caption) return;
        if (fullCaption) {
            setDisplayedCaption(caption);
        } else {
            const text = caption.length > captionShortLen ? caption.slice(0, captionShortLen) + '...' : caption;
            setDisplayedCaption(text);
        }
    }, [fullCaption, caption]);

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        if (videoRef.current) videoRef.current.pause();
    };

    const handleDownload = useCallback(() => {
        const link = document.createElement('a');
        link.href = src;
        link.download = src.split('/').pop() || 'video';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [src]);

    return (
        <div>
            <div className='app_video_utility_play_button'>
                <FaPlay size={25} color='#eaeaea' />
            </div>
            <video
                className={`${thumbnailClassName || ''} app_video_utility_thumbnail`}
                width={width}
                height={height}
                poster={poster}
                onClick={handleOpen}
                onLoadedData={onload}
                style={{
                    borderRadius: rounded ? '50%' : '6px',
                    cursor: 'pointer',
                }}
            >
                <source src={src} />
            </video>

            {isOpen && (
                <div className="app_video_utility_modal">
                    <div className="app_video_utility_modal_topbar">
                        <div style={{ marginLeft: "auto " }} className="app_utility_icon" onClick={handleDownload}>
                            <HiOutlineDownload color="#eeeeee" size={28} />
                        </div>
                        <div className="app_utility_icon" onClick={handleClose}>
                            <IoClose color="#eeeeee" size={28} />
                        </div>
                    </div>

                    <video
                        ref={videoRef}
                        className="app_utility_video"
                        controls
                        autoPlay
                        poster={poster}
                    >
                        <source src={src} />
                        Your browser does not support the video tag.
                    </video>

                    {caption && (
                        <div className="app_utility_caption">
                            {caption.length > captionShortLen ? (
                                <div>
                                    {displayedCaption}
                                    <span
                                        className="app_utility_toggle_caption"
                                        onClick={() => setFullCaption(!fullCaption)}
                                    >
                                        {fullCaption ? 'Show less' : 'Show more'}
                                    </span>
                                </div>
                            ) : (
                                <div>{caption}</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoViewer;
