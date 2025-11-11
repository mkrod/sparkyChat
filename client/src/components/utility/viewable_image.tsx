import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HiOutlineDownload } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import "./css/viewable_image.css";

interface ImageViewerProps {
  src: string;
  alt?: string;
  caption?: string;
  onload?: () => void;
  options: {
    thumbnailClassName?: string;
    height?: string | number;
    width?: string | number;
    rounded?: boolean;
  };
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  options,
  src,
  alt = '',
  onload,
  caption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { thumbnailClassName, width = '100%', height = 'auto', rounded = false } = options;

  const [fullCaption, setFullCaption] = useState(false);
  const [displayedCaption, setDisplayedCaption] = useState('');
  const captionShortLen = 20;

  const [canDispGuide, setCanDispGuide] = useState<boolean>(false);
  const [displayGuide, setDisplayGuide] = useState<boolean>(true);

  useEffect(() => {
    const inst = localStorage.getItem('show_image_viewer_guide');
    if (!inst) return setCanDispGuide(true);
    return setCanDispGuide(inst === 'yes');
  }, [displayGuide]);

  useEffect(() => {
    if (!caption) return;
    if (fullCaption) setDisplayedCaption(caption);
    else {
      const text = caption.length > captionShortLen ? caption.slice(0, captionShortLen) + '...' : caption;
      setDisplayedCaption(text);
    }
  }, [fullCaption, caption]);

  const handleOpen = () => {
    setIsOpen(true);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleClose = () => {
    setIsOpen(false);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const newScale = Math.min(Math.max(0.5, scale - e.deltaY * 0.001), 5);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setTranslate({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (!isOpen) return;
    const imgElement = imgRef.current;
    if (imgElement) imgElement.addEventListener('wheel', handleWheel, { passive: false });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (imgElement) imgElement.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, scale, startPos, isDragging, translate]);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = src.split('/').pop() || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [src]);

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={handleOpen}
        onLoad={onload}
        className={`${thumbnailClassName || ''} app_utility_thumbnail`}
        style={{
          width,
          height,
          borderRadius: rounded ? '50%' : '6px',
        }}
      />

      {isOpen && (
        <div className={`app_utility_modal ${isDragging ? 'app_utility_dragging' : ''}`}>
          <div className="app_utility_modal_topbar">
            <div style={{ marginLeft: "auto"}} className="app_utility_icon" onClick={handleDownload}>
              <HiOutlineDownload color="#eeeeee" size={30} />
            </div>
            <div className="app_utility_icon" onClick={handleClose}>
              <IoClose color="#eeeeee" size={30} />
            </div>
          </div>

          {canDispGuide && displayGuide && (
            <div className="app_utility_guide_box">
              <span>
                Scroll vertically to zoom in/out, and drag to move the image.
              </span>
              <div className="app_utility_guide_buttons">
                <button
                  className="app_utility_button_close"
                  onClick={() => setDisplayGuide(false)}
                >
                  close
                </button>
                <button
                  className="app_utility_button_dontshow"
                  onClick={() => {
                    localStorage.setItem('show_image_viewer_guide', 'no');
                    setCanDispGuide(false);
                  }}
                >
                  do not show again
                </button>
              </div>
            </div>
          )}

          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onMouseDown={handleMouseDown}
            className="app_utility_full_image"
            style={{
              transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            }}
          />

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
    </>
  );
};

export default ImageViewer;
