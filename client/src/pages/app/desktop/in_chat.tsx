import { useRef, useState, type FC, type FormEvent, type JSX } from 'react'
import "./css/in_chat.css";
import { useChatProvider } from '@/constants/providers/chatProvider';
import { LuPhone, LuVideo } from 'react-icons/lu';
import { HiDotsVertical, HiOutlineEmojiHappy } from 'react-icons/hi';
import { defaultDp } from '@/constants';
import { TbPaperclip } from 'react-icons/tb';
import { PiPaperPlaneTiltFill } from 'react-icons/pi';
import { restoreCaret, saveCaret, scrollElementToBottom } from '@/constants/vars';
import { useDataProvider } from '@/constants/providers/data_provider';
import NoChatSelected from '@/components/utility/no_chat_selected';

const InChat: FC = (): JSX.Element => {
    const { activeColor } = useChatProvider();
    const { currentChatMessages, currentChatId } = useDataProvider();

    ///////////////////////// input caret management
    const [textValue, setTextValue] = useState("");
    const inputRef = useRef<HTMLDivElement | null>(null);
    const caretPosRef = useRef<number | null>(null);
  
    const handleTextChange = (e: FormEvent<HTMLDivElement>) => {
        saveCaret(window, caretPosRef);
        const text = e.currentTarget.textContent || "";
        setTextValue(text);
        requestAnimationFrame(() => {
          restoreCaret(window, caretPosRef, inputRef);
          scrollElementToBottom(inputRef);
        });
    };
    
//////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////




    return currentChatId ? (
        <div style={{ borderColor: activeColor.fadedBorder }} className='in_chat_container'>
            <div style={{ borderColor: activeColor.fadedBorder }} className="in_chat_header_container">
                <div className="in_chat_header_image_container">
                    <img className="in_chat_header_image" src={defaultDp} alt="" />
                </div>

                <div className="in_chat_header_details_container">
                    <div className="in_chat_header_name_container">Sharkor Motele</div>
                    <div style={{ color: activeColor.textFadeSecondary }} className="in_chat_header_status_container">Online</div>
                </div>

                <div className="in_chat_header_other_icons">
                    <div title='Voice Call' className="in_chat_header_icon">
                        <LuPhone size={17} color='var(--app-accent)' />
                    </div>
                    <div title='Video Call' className="in_chat_header_icon">
                        <LuVideo size={17} color='var(--app-accent)' />
                    </div>
                    <div title='Options' className="in_chat_header_icon">
                        <HiDotsVertical size={17} color='var(--app-accent)' />
                    </div>
                </div>
            </div>
            <div className="in_chat_messages_container">

            </div>
            <div style={{ borderColor: activeColor.fadedBorder }} className="in_chat_footer_container">
                <div className="in_chat_footer_input_container">
                    {textValue === "" && <span style={{ color: activeColor.textFadeSecondary }} className="in_chat_footer_input_placeholder">Type a message...</span>}
                    <div
                        style={{ color: activeColor.textFade }}
                        onInput={handleTextChange}
                        contentEditable
                        className='in_chat_footer_input_field'
                        ref={inputRef}
                    />
                </div>
                <div className="in_chat_footer_icons_container">
                    <div title='Add a file' className="in_chat_header_icon">
                        <input type='file' className='in_chat_footer_file_field' />
                        <TbPaperclip size={20} color='var(--app-accent)' />
                    </div>
                    <div title='Emoji' className="in_chat_header_icon">
                        <HiOutlineEmojiHappy size={20} color='var(--app-accent)' />
                    </div>
                    <div title='Send' className="in_chat_header_icon">
                        <PiPaperPlaneTiltFill size={20} color={`${textValue === "" ? "grey" : 'var(--app-accent)'}`} />
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div style={{ borderColor: activeColor.fadedBorder }} className='in_chat_container'>
            <NoChatSelected />
        </div>
    )
}

export default InChat