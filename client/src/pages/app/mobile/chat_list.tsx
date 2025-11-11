import { useState, type Dispatch, type FC, type JSX, type SetStateAction } from 'react'
import "./css/chat_list.css";
import { useDataProvider } from '@/constants/providers/data_provider';
import MessageListcard from '@/components/app/messages/messageListCard';
import type { User } from '@/constants/types';
import { useConnProvider } from '@/constants/providers/conn_provider';
import { useChatProvider } from '@/constants/providers/chatProvider';
import { IoMdAddCircleOutline } from 'react-icons/io'
import { IoSearch } from 'react-icons/io5'
import ActivityIndicator from '@/components/utility/activity_indicator'
import { serverURL } from '@/constants'

interface Props {
    visibitySetter: Dispatch<SetStateAction<boolean>>;
}
const MobileChatList: FC<Props> = ({ visibitySetter }): JSX.Element => {

    const { messagesList, setCurrentChatId } = useDataProvider();
    const { activeColor } = useChatProvider();
    const [dpIsLoading, setDpIsLoading] = useState<boolean>(true);
    const { user } = useConnProvider();

    return (
        <div className='mobile_chat_list_container'>
            <div className="mobile_home_chat_list_and_people_header">
                <div className="mobile_home_chat_list_and_people_header_top">
                    <div className="mobile_home_chat_list_and_people_header_top_left">
                        <div className="mobile_home_chat_list_and_people_header_img_container">
                            <img src={`${serverURL}/proxy?url=${encodeURIComponent(user.picture)}`} onLoad={() => setDpIsLoading(false)} className='mobile_home_chat_list_and_people_header_img' />
                            {dpIsLoading && (
                                <div style={{ background: activeColor.fadeBackground }} className='mobile_home_chat_list_and_people_header_img_skeleton'>
                                    <ActivityIndicator
                                        size='small'
                                        style='spin'
                                        color='var(--app-accent)'
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div onClick={() => visibitySetter(true)} className="mobile_home_chat_list_and_people_header_top_right">
                        <IoMdAddCircleOutline color='var(--app-accent)' size={25} />
                    </div>
                </div>
                <div className="mobile_home_chat_list_and_people_header_bottom">
                    <div
                        style={{
                            background: activeColor.fadedBorder,
                        }}
                        className="mobile_home_chat_list_and_people_header_search_container"
                    >
                        <div className='mobile_home_chat_list_and_people_header_search_icon_container'>
                            <IoSearch size={18} />
                        </div>
                        <input
                            style={{
                                color: activeColor.textFade
                            }}
                            placeholder='Search'
                            className='mobile_home_chat_list_and_people_header_search'
                        />
                    </div>
                </div>
            </div>
            <div className="mobile_chat_list_content_container">
                {messagesList.map((chat) => (
                    <MessageListcard
                        data={chat}
                        userClick={(id: User['user_id']) => setCurrentChatId(id)}
                        key={chat._id}
                        options={{
                            border: false
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default MobileChatList