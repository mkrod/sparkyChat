import InChat from '@/pages/app/desktop/in_chat'
import { type FC, type JSX, type ReactNode } from 'react'
import "./css/in_chat_layout.css";
import { useCallProvider } from '@/constants/providers/call_provider';
import Draggable from '@/components/draggable_window';
import InCall from '@/components/app/call/in_call';
import Ringing from '@/components/app/call/ringing';
import type { CallState } from '@/constants/types';
import { LuPhone, LuVideo } from 'react-icons/lu';
import { useConnProvider } from '@/constants/providers/conn_provider';

const InChatLayout: FC = (): JSX.Element => {
  const { callState } = useCallProvider();
  const { user } = useConnProvider()

  const callHeaderText: Record<CallState['type'], string> = {
    voice: "Ongoing Voice Call",
    video: "Ongoing Video Call",
  }
  const ringingHeaderText: Record<CallState['type'], string> = {
    voice: "Incoming Voice Call",
    video: "Incoming Video Call",
  }
  const callHeaderIcon: Record<CallState['type'], ReactNode> = {
    voice: <LuPhone size={17} />,
    video: <LuVideo size={17} />,
  }

  const isUserInitCall = user.user_id === callState?.initiatorId;
  const initiationstate = ["ringing", "rejected", "initiated", "ended", "accepted"] as CallState['status'][];
  return (
    <div className='in_chat_layout_container'>
      <InChat />
      {isUserInitCall && (
        <Draggable
          minHeight={500}
          minWidth={400}
          header={callHeaderText[callState?.type]}
          icon={callHeaderIcon[callState?.type]}
        >
          <InCall friend={callState.receiver} />
        </Draggable>
      )}
      {!isUserInitCall && callState?.status === "ringing" && (
        <Draggable
          minWidth={300}
          minHeight={300}
          header={ringingHeaderText[callState?.type]}
          icon={callHeaderIcon[callState?.type]}
        >
          <Ringing initiator={callState.initiator} />
        </Draggable>
      )}
      {callState && !isUserInitCall && initiationstate.every((s) => s !== callState?.status) && (
        <Draggable
          minHeight={500}
          minWidth={400}
          header={callHeaderText[callState?.type]}
          icon={callHeaderIcon[callState?.type]}
        >
          <InCall friend={callState.initiator} />
        </Draggable>
      )}
    </div>
  )
}

export default InChatLayout