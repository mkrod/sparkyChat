import InChat from '@/pages/app/desktop/in_chat'
import { type FC, type JSX } from 'react'
import "./css/in_chat_layout.css";

const InChatLayout: FC = (): JSX.Element => {

  return (
    <div className='in_chat_layout_container'>
      <InChat />
    </div>
  )
}

export default InChatLayout