import { useRef, type FC, type JSX } from 'react';
import "./css/chat_list.css";
import { LuSettings2 } from 'react-icons/lu';
import { IoSearch } from 'react-icons/io5';
import { useChatProvider } from '@/constants/providers/chatProvider';
import { useDataProvider } from '@/constants/providers/data_provider';
import MessageListcard from '@/components/app/messages/messageListCard';
import type { User } from '@/constants/types';

const DesktopChatList: FC = (): JSX.Element => {
  
  const searchRef = useRef<HTMLInputElement|null>(null);
  const { activeColor } = useChatProvider();
  const { messagesList, setCurrentChatId } = useDataProvider();

  return (
    <div className='chat_list_container'>
      <div className="chat_list_header">  { /* user_list.tsx is also using this classes in the header */ }
        <div className="chat_list_header_search_container">
          <IoSearch color={activeColor.textFade} />
          <input type='text' ref={searchRef}
          style={{color:activeColor.textFade}} placeholder='Search' className='chat_list_search_box' />
        </div>
        <div className="chat_list_options_icon_container">
          <LuSettings2 />
        </div>
      </div>

      <div className="chat_list_chats_container">
        {messagesList.map((chat) => {
          return (
            <MessageListcard
            data={chat}
            userClick={(id: User['user_id']) => setCurrentChatId(id)}
            key={chat._id} 
            />
          )
        })}
      </div>
    </div>
  )
}

export default DesktopChatList;