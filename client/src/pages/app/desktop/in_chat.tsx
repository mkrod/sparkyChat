import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FC, type FormEvent, type JSX } from 'react'
import "./css/in_chat.css";
import { useChatProvider } from '@/constants/providers/chatProvider';
import { LuPhone, LuVideo } from 'react-icons/lu';
import { HiDotsVertical, HiOutlineEmojiHappy } from 'react-icons/hi';
import { TbPaperclip } from 'react-icons/tb';
import { PiPaperPlaneTiltFill } from 'react-icons/pi';
import { createMediaPreviewObject, getUserPresenceStatus, groupMessagesByDate, restoreCaret, saveCaret, scrollElementToBottom } from '@/constants/vars';
import { useDataProvider } from '@/constants/providers/data_provider';
import NoChatSelected from '@/components/utility/no_chat_selected';
import { type PreviewMediaData, type Message, type User, type GroupedMessages } from '@/constants/types';
import { useUtilityProvider } from '@/constants/providers/utility_provider';
import socket from '@/constants/socket.io/socket_conn';
import { useConnProvider } from '@/constants/providers/conn_provider';
import { serverURL } from '@/constants';
import ActivityIndicator from '@/components/utility/activity_indicator';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import FilePreview from '@/components/app/chat/file_preview';
import MsgOut from '@/components/app/chat/msg_out';
import MsgIn from '@/components/app/chat/msg_in';
import { sendMedia } from '@/constants/message/send.media';

const InChat: FC = (): JSX.Element => {
    const { activeColor } = useChatProvider();
    const { currentChatMessages, currentChatId, presence } = useDataProvider();
    const { user } = useConnProvider();
    const { typingUsersList } = useUtilityProvider();


    const chatMessages: Message[] = (currentChatMessages && currentChatMessages.messages) || [];
    const friendData = (currentChatMessages && currentChatMessages.otherUser) as User;
    const userPresence = (currentChatMessages && presence.find((p) => p.user_id === friendData.user_id)?.status) || "offline";
    const userStatus = (currentChatMessages && getUserPresenceStatus(userPresence, friendData.last_login));
    const userTyping = (currentChatMessages && typingUsersList.find((tl) => tl.user_id === friendData.user_id)) ? true : false;
    const [dpIsLoading, setDpIsLoading] = useState<boolean>(true);
    const [sending, setSending] = useState<boolean>(false);
    //////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////file handler/////////////////////////////////////////
    //const [showFilePreview, setShowFilePreview] = useState<boolean>(false);
    const [previewMediaData, setPreviewMediaData] = useState<PreviewMediaData[]>([]);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [activeSlideNumber, setActiveSlideNumber] = useState<number>(0);
    const [mediaCaption, setMediaCaption] = useState<string[]>([]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        setMediaFiles((prev) => [...prev, ...newFiles]);
        setPreviewMediaData((prev) => [...prev, ...newFiles.map(createMediaPreviewObject)]);

        // i dont need the input , im handling the files with the state
        e.target.value = "";
    };


    const removeFile = (index: number) => {
        setPreviewMediaData((prev) => prev.filter((_, i) => i !== index));
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
        setMediaCaption((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            return updated;
        })
    };

    const destroyAllFiles = () => {
        setMediaFiles([]);
        setPreviewMediaData([]); // also clear previews
        setMediaCaption([]);
    };
    ///////////////////////////////
    //////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    ///////////////////////////// typing /////////////////////////////////////////
    ///////////////////////// input caret management
    const [sendTypingEvent, setSendTypingEvent] = useState<boolean>(true);
    const [textValue, setTextValue] = useState("");
    const inputRef = useRef<HTMLDivElement | null>(null);
    const caretPosRef = useRef<number | null>(null);
    const [repliedMsgId, setRepliedMsgId] = useState<string>();

    const handleTextChange = (e: FormEvent<HTMLDivElement>) => {
        if (!inputRef.current) return;
        saveCaret(window, caretPosRef);
        const text = e.currentTarget.textContent || "";

        if (previewMediaData.length === 0) {
            //console.log("Here")
            // Normal message typing
            setTextValue(text);

            if (sendTypingEvent && currentChatMessages) {
                socket.emit("user_typing", { sender_id: user.user_id, receiver_id: friendData.user_id });
                setSendTypingEvent(false);
                setTimeout(() => setSendTypingEvent(true), 3000);
            }
        } else {
            // Media caption typing
            setMediaCaption((prev) => {
                const updated = [...prev];
                updated[activeSlideNumber] = text;
                return updated;
            });
        }

        requestAnimationFrame(() => {
            restoreCaret(window, caretPosRef, inputRef);
            scrollElementToBottom(inputRef);
        });
    };


    //////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ////////////////////////emoji/////////////////////////////////////////////

    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const handleEmojiClick = (emojiObject: EmojiClickData) => {
        if (!inputRef.current) return;
        setTextValue((prev) => prev + emojiObject.emoji);
        inputRef.current.textContent += emojiObject.emoji
    }

    //////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////
    const chatScreen = useRef<HTMLDivElement | null>(null);
    const grouppedMessages = useMemo(() => {
        return groupMessagesByDate(chatMessages);
    }, [chatMessages]);
      

    useEffect(() => {
        if (!chatScreen.current) return;
        //scroll to bottom
        requestAnimationFrame(() => {
            scrollElementToBottom(chatScreen);
        })
    }, [chatMessages.length]);

    //console.log(chatMessages)
    //console.log(grouppedMessages) //im seeing this log multiple times in the console, like a infinite rendering is happening

    //////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ////////////////////////send logic/////////////////////////////////////////////





    const send = async () => {
        //send it as array of object and insert with loop
        //so it can handle multiple media sent
        if(sending) return;
        if (mediaFiles.length === 0 && textValue === "") return;

        setSending(true);
        if (mediaFiles.length === 0) {
            const message: Message = {
                senderId: user?.user_id,
                receiverId: friendData?.user_id,
                chatId: crypto.randomUUID(),
                content: textValue,
                type: "text",
                timestamp: new Date(),
                status: "sent",
                replyTo: repliedMsgId,
            }

            socket.emit("new_message", { message })
            setTextValue("");
            if (inputRef.current) {
                inputRef.current.textContent = "";
            }
        } else {
            const formData = new FormData();
            const users = {
                senderId: user.user_id,
                receiverId: friendData.user_id
            }
            formData.append("users", JSON.stringify(users));
            mediaFiles.forEach((mf, i) => {
                const meta = { caption: mediaCaption[i] }
                formData.append("files", mf);
                formData.append("metadata", JSON.stringify(meta));
            })


            const response = await sendMedia({ formData });
            if (response.status !== 200) {
                setSending(false);
                return
            };

            setMediaCaption([]);
            setMediaFiles([]);
            setPreviewMediaData([]);

        }


        setSending(false);
    }



    return currentChatId && currentChatMessages ? (
        <div style={{ borderColor: activeColor.fadedBorder }} className='in_chat_container'>
            <div style={{ borderColor: activeColor.fadedBorder }} className="in_chat_header_container">
                <div className="in_chat_header_image_container">
                    {dpIsLoading && (
                        <div style={{ background: activeColor.fadeBackground }} className='app_nav_header_img_skeleton'>
                            <ActivityIndicator
                                size='small'
                                style='spin'
                                color='var(--app-accent)'
                            />
                        </div>
                    )}
                    <img className="in_chat_header_image" onLoad={() => setDpIsLoading(false)} src={`${serverURL}/proxy?url=${encodeURIComponent(friendData.picture)}`} alt="" />
                </div>

                <div className="in_chat_header_details_container">
                    <div className="in_chat_header_name_container">{friendData.name.first + " " + friendData.name.last}</div>
                    {!userTyping && <div style={{ color: activeColor.textFadeSecondary }} className="in_chat_header_status_container">{userStatus}</div>}
                    {userTyping && <div className="in_chat_header_typing_container">Typing...</div>}
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
            <div ref={chatScreen} className="in_chat_messages_container">
                {grouppedMessages.map((gm: GroupedMessages, idx: number) => {

                    return (
                        <div key={idx} className='in_chat_messages_section'>
                            <div style={{ color: activeColor.textFade, zIndex: "5"  }} className='in_chat_message_section_date_container'>
                                <span style={{ background: activeColor.fadeBackground}} className='in_chat_message_section_date'>{gm.dateLabel}</span>
                            </div>
                            <div className='in_chat_messages_section_messages'>
                                {gm.messages.map((m, index) => {
                                    const whoSentLastMsgId = chatMessages[index - 1]?.senderId;
                                    const whoReceivedLastMsgId = chatMessages[index - 1]?.chatId;
                                    const LastMsgTimestamp = chatMessages[index - 1]?.timestamp;

                                    const iSentLastsg = whoSentLastMsgId === user.user_id;
                                    const iReceivedLastMsg = whoReceivedLastMsgId === user.user_id;
                                    const sameTime = m.timestamp === LastMsgTimestamp;



                                    switch (m.senderId) {
                                        case user.user_id:
                                            return (
                                                <MsgOut
                                                    key={index}
                                                    message={m}
                                                    stack={iSentLastsg && sameTime}
                                                />

                                            )
                                        default:
                                            return (
                                                <MsgIn
                                                    key={index}
                                                    message={m}
                                                    stack={iReceivedLastMsg && sameTime}
                                                    friendData={friendData}
                                                    parentContainer={chatScreen}
                                                />
                                            )
                                    }

                                })}
                            </div>
                        </div>
                    )

                })}
            </div>
            <div style={{ borderColor: activeColor.fadedBorder }} className="in_chat_footer_container">
                <div className="in_chat_footer_input_container">
                    {previewMediaData.length === 0 && textValue === "" && <span style={{ color: activeColor.textFadeSecondary }} className="in_chat_footer_input_placeholder">Type a message...</span>}
                    {previewMediaData.length > 0 && (mediaCaption[activeSlideNumber] === "" || mediaCaption[activeSlideNumber] === undefined) && <span style={{ color: activeColor.textFadeSecondary }} className="in_chat_footer_input_placeholder">Add a caption...</span>}
                    <div
                        style={{ color: activeColor.textFade }}
                        onInput={handleTextChange}
                        contentEditable
                        className='in_chat_footer_input_field'
                        ref={inputRef}
                        suppressContentEditableWarning
                    >
                        {previewMediaData.length === 0
                            ? textValue
                            : mediaCaption[activeSlideNumber] || ""}
                    </div>

                </div>
                <div className="in_chat_footer_icons_container">
                    <div title='Add a file' className="in_chat_header_icon">
                        <input type='file' multiple onChange={handleFileChange} className='in_chat_footer_file_field' />
                        <TbPaperclip size={20} color='var(--app-accent)' />
                    </div>
                    <div onClick={() => setShowEmojiPicker((prev) => !prev)} title='Emoji' className="in_chat_header_icon">
                        <HiOutlineEmojiHappy size={20} color='var(--app-accent)' />
                    </div>
                    <div title='Send' className="in_chat_header_icon" onClick={send}>
                        {!sending && <PiPaperPlaneTiltFill size={20} color={`${textValue === "" && previewMediaData.length === 0 && sending ? "grey" : 'var(--app-accent)'}`} />}
                        {sending && <ActivityIndicator size='small' style='spin' />}
                    </div>
                </div>
                <div style={{ borderColor: activeColor.fadedBorder }} className={`in_chat_footer_emoji_container ${showEmojiPicker ? "active" : ""}`}>
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            </div>
            {previewMediaData.length > 0 &&
                (<div style={{ background: activeColor.background }} className={`in_chat_media_preview_container ${previewMediaData.length > 0 ? "active" : ""}`}>
                    <FilePreview
                        mediaData={previewMediaData}
                        removeFile={(index) => removeFile(index)}
                        exit={destroyAllFiles}
                        activeSlideNumber={activeSlideNumber}
                        setActiveSlideNumber={(ind) => setActiveSlideNumber(ind)}
                        sending={sending}
                    />
                </div>)}
        </div>
    ) : (
        <div style={{ borderColor: activeColor.fadedBorder }} className='in_chat_container'>
            <NoChatSelected />
        </div>
    )
}

export default InChat