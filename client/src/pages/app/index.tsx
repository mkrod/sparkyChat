import { useChatProvider } from '@/constants/providers/chatProvider'
import { useState, type FC, type JSX } from 'react';
import "./css/index.css";
import "./css/mobile_index.css";
import DesktopChatList from './desktop/chat_list';
import InChatLayout from '@/layouts/in_chat_layout';
import { useDataProvider } from '@/constants/providers/data_provider';
import PeopleScreen from './desktop/people_screen';

const AppHome: FC = (): JSX.Element => {

  const { isMobile, activeColor } = useChatProvider();
  const { messagesList } = useDataProvider();
  const [openUsersList, setOpenUsersList ] = useState<boolean>(false);


  return !isMobile ? (
    <div className='app_home_container'>
      <div className='app_home_header_container'>
        <span style={{color: activeColor.textFade}} className='app_home_header_text'>Chat</span>
        <button onClick={() => setOpenUsersList(true)} className='app_home_header_button'>New Message</button>
      </div>

      <div className='app_home_content_container'>
        <div className="app_home_chat_list_container">
          {(!openUsersList && messagesList.length > 0) && <DesktopChatList />}
          {(openUsersList || messagesList.length === 0) && (<PeopleScreen visibitySetter={setOpenUsersList} />)}
        </div>
        <div className="app_home_in_chat_container">
          <InChatLayout /> {/** for stuffs like in chat ui, user profile, etc (call UI will be a popup overlay and maybe the user details too for simplicity) */}
        </div>
      </div>
    </div>
  ) : (
    <div>
      Mobile View {/** Active Page in Navbar here */}
    </div>
  )
}

export default AppHome