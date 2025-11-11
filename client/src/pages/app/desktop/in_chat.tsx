import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FC, type JSX } from 'react'
import "./css/in_chat.css";
import { useChatProvider } from '@/constants/providers/chatProvider';
import { LuPhone, LuVideo } from 'react-icons/lu';
import { HiDotsVertical, HiOutlineEmojiHappy } from 'react-icons/hi';
import { TbPaperclip } from 'react-icons/tb';
import { PiPaperPlaneTiltFill } from 'react-icons/pi';
import { createMediaPreviewObject, getUserPresenceStatus, groupMessagesByDate, scrollElementToBottom } from '@/constants/vars';
import { useDataProvider } from '@/constants/providers/data_provider';
import NoChatSelected from '@/components/utility/no_chat_selected';
import { type PreviewMediaData, type Message, type User, type GroupedMessages, type StartCallPayload } from '@/constants/types';
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
import EditableInput from '@/components/app/chat/input';
import { useCallProvider } from '@/constants/providers/call_provider';
import { MdArrowBackIos, MdOutlineMic } from 'react-icons/md';
import ImageViewer from '@/components/utility/viewable_image';
import { useAudioRecorder } from '@/constants/audio_recorder';
import AudioRecorderUi from '@/components/utility/audio_recorder_ui';

const InChat: FC = (): JSX.Element => {
    const { activeColor, isMobile } = useChatProvider();
    const { fetchingCurrentChat, currentChatMessages, currentChatId, setCurrentChatId, presence } = useDataProvider();
    const { user } = useConnProvider();
    const { typingUsersList } = useUtilityProvider();
    const { startCall, callState } = useCallProvider()


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
    const [repliedMsgId, setRepliedMsgId] = useState<string>("");

    const handleTextChange = (value: string) => {
        const text = value || "";

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

    };


    //////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ////////////////////////emoji/////////////////////////////////////////////

    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const handleEmojiClick = (emojiObject: EmojiClickData) => {
        setTextValue((prev) => prev + emojiObject.emoji);
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



    const inputPlaceholder =
        previewMediaData.length === 0 && textValue.trim() === ""
            ? "Type a message..."
            : previewMediaData.length > 0 &&
                (mediaCaption[activeSlideNumber]?.trim() === "" ||
                    mediaCaption[activeSlideNumber] === undefined)
                ? "Add a caption..."
                : "";
    const inputValue =
        previewMediaData.length === 0
            ? textValue
            : mediaCaption[activeSlideNumber] || "";


    const initCall = (payload: StartCallPayload) => {
        startCall(payload)
    }


    const footerRef = useRef<HTMLDivElement | null>(null);
    const [footerHeight, setFooterHeight] = useState<number | undefined>(footerRef.current?.clientHeight);

    useEffect(() => {
        if (!footerRef.current) return;
        const footer = footerRef.current;

        setFooterHeight(footer.clientHeight + 1)
    }, [footerRef.current]);
    useEffect(() => {
        if (!footerRef.current) return;
        const footer = footerRef.current;

        const handleResize = () => {
            alert("Resized")
            setFooterHeight(footer.clientHeight + 1);
        }
        footer.addEventListener("resize", () => handleResize);
        return () => footer.removeEventListener("resize", () => handleResize);
    }, [footerRef.current])


    //recorder
    const { isRecording, startRecorder, stopRecorder, getAudioBlob, elapsed, elapsedInNumber, audioChunks } = useAudioRecorder();

    //////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ////////////////////////send logic/////////////////////////////////////////////





    const send = async () => {
        if (sending) return;
        setSending(true);
      
        try {
          // 1️⃣ Handle audio first
          stopRecorder(); // flush final chunk
          const audioBlob = getAudioBlob();
    
          //console.log(audioBlob)
          
          if (audioBlob) {
            const formData = new FormData();
            const users = {
              senderId: user.user_id,
              receiverId: friendData.user_id,
            };
            const meta = { duration: elapsedInNumber };
            formData.append("metadata", JSON.stringify(meta));
            formData.append("users", JSON.stringify(users));
            formData.append("files", audioBlob, "voice_record.webm");
      
            const response = await sendMedia({ formData });
            if (response.status !== 200) {
                audioChunks.current = [];
              return; // error handled by catch
            }
            audioChunks.current = [];
            return; // audio sent, exit early
          }
      
          // 2️⃣ Handle text-only messages
          if (mediaFiles.length === 0 && textValue === "") return;
      
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
            };
      
            socket.emit("new_message", { message });
            setTextValue("");
          } else {
            // 3️⃣ Handle media files
            const formData = new FormData();
            const users = {
              senderId: user.user_id,
              receiverId: friendData.user_id,
            };
            formData.append("users", JSON.stringify(users));
      
            mediaFiles.forEach((mf, i) => {
              const meta = { caption: mediaCaption[i] };
              formData.append("files", mf);
              formData.append("metadata", JSON.stringify(meta));
            });
      
            const response = await sendMedia({ formData });
            if (response.status !== 200) return;
      
            setMediaCaption([]);
            setMediaFiles([]);
            setPreviewMediaData([]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setSending(false);
        }
      };
      


    return currentChatId && currentChatMessages && !fetchingCurrentChat ? (
        <div style={{ borderColor: activeColor.fadedBorder }} className='in_chat_container'>
            <div style={{
                borderColor: activeColor.fadedBorder,
                height: isMobile ? "4.5rem" : "3.5rem",
                padding: isMobile ? "1rem" : "0.5rem 1rem"
            }} className="in_chat_header_container">
                {isMobile &&
                    <div onClick={() => setCurrentChatId(undefined)} className='in_chat_header_back'>
                        <MdArrowBackIos size={25} />
                    </div>
                }
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
                    {/*<img className="in_chat_header_image" onLoad={() => setDpIsLoading(false)} src={`${serverURL}/proxy?url=${encodeURIComponent(friendData.picture)}`} alt="" />*/}
                    <ImageViewer
                        src={`${serverURL}/proxy?url=${encodeURIComponent(friendData.picture)}`}
                        options={{
                            thumbnailClassName: "in_chat_header_image",
                            rounded: true
                        }}
                        onload={() => setDpIsLoading(false)}
                    />
                </div>

                <div className="in_chat_header_details_container">
                    <div className="in_chat_header_name_container">{friendData.name.first + " " + friendData.name.last}</div>
                    {!userTyping && <div style={{ color: activeColor.textFadeSecondary }} className="in_chat_header_status_container">{userStatus}</div>}
                    {userTyping && <div className="in_chat_header_typing_container">Typing...</div>}
                </div>

                <div className="in_chat_header_other_icons">
                    <button disabled={!!callState} onClick={() => initCall({ type: "voice", receiverId: friendData.user_id })} title='Voice Call' className="in_chat_header_icon">
                        <LuPhone size={17} color='var(--app-accent)' />
                    </button>
                    <button disabled={!!callState} onClick={() => initCall({ type: "video", receiverId: friendData.user_id })} title='Video Call' className="in_chat_header_icon">
                        <LuVideo size={17} color='var(--app-accent)' />
                    </button>
                    <div title='Options' className="in_chat_header_icon">
                        <HiDotsVertical size={17} color='var(--app-accent)' />
                    </div>
                </div>
            </div>
            <div ref={chatScreen} className="in_chat_messages_container">
                {grouppedMessages.map((gm: GroupedMessages, idx: number) => {

                    return (
                        <div key={idx} className='in_chat_messages_section'>
                            <div style={{ color: activeColor.textFade, zIndex: "5" }} className='in_chat_message_section_date_container'>
                                <span style={{ background: activeColor.fadeBackground }} className='in_chat_message_section_date'>{gm.dateLabel}</span>
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
            {!isRecording && <div
                ref={footerRef}
                style={{ borderColor: activeColor.fadedBorder }}
                className="in_chat_footer_container"
            >
                <div className="in_chat_footer_input_container">
                    <EditableInput
                        value={inputValue}
                        placeholder={inputPlaceholder}
                        onChange={handleTextChange}
                    />
                </div>
                <div className="in_chat_footer_icons_container">
                    <div title='Add a file' className="in_chat_header_icon">
                        <input type='file' multiple onChange={handleFileChange} className='in_chat_footer_file_field' />
                        <TbPaperclip size={20} color='var(--app-accent)' />
                    </div>
                    <div onClick={() => setShowEmojiPicker((prev) => !prev)} title='Emoji' className="in_chat_header_icon">
                        <HiOutlineEmojiHappy size={20} color='var(--app-accent)' />
                    </div>
                    {(textValue.trim() !== "" || previewMediaData.length > 0) && (
                        <div title='Send' className="in_chat_header_icon" onClick={send}>
                            {!sending && <PiPaperPlaneTiltFill size={20} color={`${textValue.trim() === "" && previewMediaData.length === 0 && sending ? "grey" : 'var(--app-accent)'}`} />}
                            {sending && <ActivityIndicator size='small' style='spin' />}
                        </div>
                    )}
                    {textValue.trim() === "" && previewMediaData.length === 0 && (
                        <div title='Record' className="in_chat_header_icon" onClick={startRecorder}>
                            {!sending && <MdOutlineMic size={20} color={`${textValue.trim() === "" && previewMediaData.length === 0 && sending ? "grey" : 'var(--app-accent)'}`} />}
                            {sending && <ActivityIndicator size='small' style='spin' />}
                        </div>
                    )}
                </div>
                <div style={{ borderColor: activeColor.fadedBorder }} className={`in_chat_footer_emoji_container ${showEmojiPicker ? "active" : ""}`}>
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            </div>}
            {isRecording && (
                <div
                    ref={footerRef}
                    style={{ borderColor: activeColor.fadedBorder }}
                    className="in_chat_footer_container"
                >
                    <AudioRecorderUi
                        stopRecorder={stopRecorder}
                        send={send}
                        sending={sending}
                        elapsed={elapsed}
                    />
                </div>
            )}
            {previewMediaData.length > 0 &&
                (<div style={{ background: activeColor.background, bottom: footerHeight }} className={`in_chat_media_preview_container ${previewMediaData.length > 0 ? "active" : ""}`}>
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
    ) : fetchingCurrentChat ? (
        <div className='in_chat_loading_container'>
            <ActivityIndicator color='var(--app-accent)' />
        </div>
    ) : (
        <div style={{ borderColor: activeColor.fadedBorder }} className='in_chat_container'>
            <NoChatSelected />
        </div>
    )
}

export default InChat