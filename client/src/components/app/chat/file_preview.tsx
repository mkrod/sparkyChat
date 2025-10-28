import { useEffect, type FC, type JSX } from 'react';
import "./css/file_preview.css";
import type { PreviewMediaData } from '@/constants/types';
import { useChatProvider } from '@/constants/providers/chatProvider';
import { TfiAngleDoubleLeft } from 'react-icons/tfi';
import { RiDeleteBinLine } from 'react-icons/ri';


interface Props {
    mediaData: PreviewMediaData[];
    removeFile: (i: number) => void;
    exit: () => void;
    activeSlideNumber: number;
    setActiveSlideNumber: (i: number) => void;
    sending: boolean;
}

type data = {
    data: PreviewMediaData;
    click: () => void;
    ind: number;
}


const FilePreview: FC<Props> = ({ mediaData, removeFile, exit, activeSlideNumber, setActiveSlideNumber }): JSX.Element => {
    const { activeColor } = useChatProvider();
    const borderColor = activeColor.fadedBorder;
    //const [activeSlideNumber, setActiveSlideNumber] = useState<number>(0);
    const activeSlide = mediaData[activeSlideNumber] ?? null;
    const name = activeSlide?.fileName || "";


    useEffect(() => {
        if (activeSlideNumber >= mediaData.length) {
            setActiveSlideNumber(mediaData.length - 1 >= 0 ? mediaData.length - 1 : 0);
        }
    }, [mediaData]);
    const handleRemove = (index: number) => {
        removeFile(index);
    };

    console.log(activeSlideNumber);


    ////// component
    const CarouselCard: FC<data> = ({ data, click, ind }): JSX.Element => {
        const isActive = activeSlideNumber === ind;

        switch (data.fileType) {
            case "photo":
                return (
                    <div onClick={click} style={{
                        border: isActive ? "2px solid var(--app-accent)" : "0.5px solid" + borderColor,
                    }} className={`file_preview_carousel_container ${isActive ? "showing" : ""}`}>
                        <img src={data.previewUrl} className='file_preview_carousel_item_image' />
                        <span className='file_preview_carousel_item_file_size'>{data.fileSize}</span>
                        <div onClick={() => handleRemove(ind)} className="file_preview_carousel_remove">
                            <RiDeleteBinLine size={20} />
                        </div>
                    </div>
                );

            case "video":
                return (
                    <div onClick={click} style={{
                        border: isActive ? "2px solid var(--app-accent)" : "0.5px solid" + borderColor,
                    }} className={`file_preview_carousel_container ${isActive ? "showing" : ""}`}>
                        <video autoPlay={false} controls={false} loop={false} src={data.previewUrl} className='file_preview_carousel_item_image' />
                        <span className='file_preview_carousel_item_file_size'>{data.fileSize}</span>
                        <div onClick={() => handleRemove(ind)} className="file_preview_carousel_remove">
                            <RiDeleteBinLine size={20} />
                        </div>
                    </div>
                );

            default:
                return (
                    <div onClick={click} style={{
                        border: isActive ? "2px solid var(--app-accent)" : "0.5px solid" + borderColor,
                    }} className={`file_preview_carousel_container ${isActive ? "showing" : ""}`}>
                        <span className='file_preview_carousel_item_extension'>{data.fileExtension.toUpperCase()}</span>
                        <span className='file_preview_carousel_item_file_size'>{data.fileSize}</span>
                        <div onClick={() => handleRemove(ind)} className="file_preview_carousel_remove">
                            <RiDeleteBinLine size={20} />
                        </div>
                    </div>
                );
        }
    }
    // /


    const contentPreview = (): JSX.Element | null => {
        if (!activeSlide) return null; // ✅ prevent crash
      
        const ext = activeSlide.fileExtension;
        switch (activeSlide.fileType) {
          case "photo":
            return (
              <div className={`file_preview_content_container ${activeSlide.fileType.toLowerCase()}`}>
                <img src={activeSlide.previewUrl} className='file_preview_content_image' />
              </div>
            );
          case "video":
            return (
              <div className={`file_preview_content_container ${activeSlide.fileType.toLowerCase()}`}>
                <video controls src={activeSlide.previewUrl} className='file_preview_content_image' />
              </div>
            );
          default:
            return (
              <div className={`file_preview_content_container ${activeSlide.fileType.toLowerCase()}`}>
                <span style={{ background: activeColor.fadeBackground }} className='file_preview_content_extension'>
                  {ext.toUpperCase()}
                </span>
              </div>
            );
        }
      };
      




    return (
        <div className='file_preview_container'>
            <div onClick={exit} style={{ borderColor }} className="file_preview_header_container">
                <div title='Cancel All' className="file_preview_header_back_container">
                    <TfiAngleDoubleLeft />
                </div>
                <div className="file_preview_header_name_container">
                    <span>{name.length > 20 ? `${name.slice(0, 20)}...` : name}</span>
                </div>
                <div className="file_preview_header_options_container">

                </div>
            </div>
            {activeSlide && contentPreview()}
            {mediaData && mediaData.length > 1 &&
                (<div className="file_preview_content_carousel">
                    {mediaData.map((d, i) => (
                        <CarouselCard
                            data={d}
                            ind={i}
                            key={d.previewUrl}
                            click={() => setActiveSlideNumber(i)}
                        />
                    ))}
                </div>)}
        </div>
    )
}

export default FilePreview