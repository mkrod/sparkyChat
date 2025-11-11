import { useEffect, useState, type FC, type JSX, type ReactNode } from 'react';
import "./css/messageListCard.css";
import type { Message, MessageList, Presence, User } from '@/constants/types';
import { formatDate, presenceColor, statusIcon } from '@/constants/vars';
import { MdOutlineImage } from 'react-icons/md';
import { IoIosDocument, IoIosVideocam } from 'react-icons/io';
import { AiFillAudio } from 'react-icons/ai';
import { useChatProvider } from '@/constants/providers/chatProvider';
import { useDataProvider } from '@/constants/providers/data_provider';
import { useConnProvider } from '@/constants/providers/conn_provider';
import { useUtilityProvider } from '@/constants/providers/utility_provider';
import { serverURL } from '@/constants';
import ActivityIndicator from '@/components/utility/activity_indicator';
import ImageViewer from '@/components/utility/viewable_image';

interface Props {
    data: MessageList;
    userClick?: (userId: User['user_id']) => void;
    options: Record<string, any>
}

const MessageListcard: FC<Props> = ({ data, userClick, options }): JSX.Element => {

    const { activeColor } = useChatProvider();
    const { presence, currentChatId } = useDataProvider();
    const { user } = useConnProvider();
    const { typingUsersList } = useUtilityProvider();

    const name: string = data.otherPartyData.name.first + " " + data.otherPartyData.name.last;



    const [userPresence, setUserPresence] = useState<Presence['status']>("offline");
    const [dpIsLoading, setDpIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const userPresence: Presence | undefined = presence.find((p) => p.user_id === data.otherPartyData.user_id);

        if (!userPresence) {
            setUserPresence("offline");
            return;
        }
        setUserPresence(userPresence.status);
    }, [presence]);

    ////////////////////////////
    const time: string = formatDate(data.lastTimestamp);
    const returnMessageTypeAsIcon = (type: Message['type']): ReactNode | null => {
        switch (type) {
            case "image":
                return <MdOutlineImage />;
            case "video":
                return <IoIosVideocam />;
            case "text":
                return null;
            case "audio":
                return <AiFillAudio />;
            case "file":
                return <IoIosDocument />;
            default:
                return null;
        }
    }

    const returnMessageTypeAsText = (type: Message['type'], text: string): string => {
        switch (type) {
            case "image":
                return "Photo";
            case "video":
                return "Video";
            case "audio":
                return "Audio";
            case "file":
                return "File";
            default:
                return text.length > 25 ? text.slice(0, 25) + "..." : text;
        }
    }

    /////////////  typing
    const userTyping = (typingUsersList.find((tl) => tl.user_id === data.otherPartyData.user_id)) ? true : false;
    return (
        <div style={{ borderColor: options.border ? activeColor.fadedBorder : "" }} className='message_list_card_container'>
            <div className={`message_list_card_is_active ${currentChatId === data.otherPartyData.user_id ? "active" : ""}`} />
            <div className="message_list_card_image_container">
                {dpIsLoading && (
                    <div style={{ background: activeColor.fadeBackground }} className='app_nav_header_img_skeleton'>
                        <ActivityIndicator
                            size='small'
                            style='spin'
                            color='var(--app-accent)'
                        />
                    </div>
                )}
                <ImageViewer 
                src={`${serverURL}/proxy?url=${encodeURIComponent(data.otherPartyData.picture)}`}
                options={{
                    thumbnailClassName: "message_list_card_image",
                    rounded: true,
                    height: "100%",
                    width: "100%"
                }}
                onload={() => setDpIsLoading(false)}
                />
                {/*<img onLoad={() => setDpIsLoading(false)} src={`${serverURL}/proxy?url=${encodeURIComponent(data.otherPartyData.picture)}`} className='message_list_card_image' />*/}
                <div
                    style={{ backgroundColor: presenceColor[userPresence] }}
                    className="message_list_card_presence_indicator">
                </div>
            </div>
            <div onClick={() => userClick ? userClick(data.otherPartyData.user_id) : null} className="message_list_card_content_name_container">
                <div className="message_list_card_content_user_name_container">
                    <span className='message_list_card_content_user_name'>{name}</span>
                </div>
                {userTyping ?
                    (<div className='message_list_card_content_typing_container'>
                        Typing...
                    </div>)
                    :
                    (<div className="message_list_card_content_container">
                        {data.lastSenderId === user.user_id ? (
                            <div className="message_list_card_content_message_status_icon_container">
                                {statusIcon[data.lastMessageStatus]}
                            </div>) : ""}
                        {returnMessageTypeAsIcon(data.lastMessageType)} {/* for icon rendering if its image, video, etc */}
                        <span
                            style={{ color: activeColor.textFadeSecondary }}
                            className='message_list_card_content_last_message'>
                            {returnMessageTypeAsText(data.lastMessageType, data.lastMessage)}
                        </span>
                    </div>)}
            </div>
            <div className="message_list_card_meta_container">
                <span
                    style={{ color: activeColor.textFadeSecondary }}
                    className='message_list_card_meta_timestamp'>
                    {time}
                </span>
                {data.unreadCount > 0 && <div className="message_list_card_meta_unread_count_container">
                    <span className='message_list_card_meta_unread_count'>{data.unreadCount}</span>
                </div>}
            </div>
        </div>
    )
}

export default MessageListcard