import DesktopNavbar from '@/components/app/navbar';
import { useChatProvider } from '@/constants/providers/chatProvider';
import { type FC, type JSX, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router';
import "./css/app_layout.css";
import { ConnectionProvider, useConnProvider } from '@/constants/providers/conn_provider';
import { UtilityProvider } from '@/constants/providers/utility_provider';
import { PeopleProvider } from '@/constants/providers/people_provider';
import { CallProvider, useCallProvider } from '@/constants/providers/call_provider';
import MobileNavbar from '@/components/app/mobile/navbar';
import { NotificationProvider, useNotificationProvider } from '@/constants/providers/notification_provider';
import { LuPhone, LuVideo } from 'react-icons/lu';
import type { CallState } from '@/constants/types';
import InCall from '@/components/app/call/in_call';
import Draggable from '@/components/draggable_window';
import Ringing from '@/components/app/call/ringing';
import MobileInCall from '@/components/app/call/mobile_in_call';
import { OffNotifyProvider } from '@/constants/providers/offline_notify_provider';
import MiniNotification from '@/components/app/notification/mini_notification';
import { SettingsProvider } from '@/constants/providers/settings.provider';


const AppProviders = ({ children }: { children: ReactNode }) => (
  <ConnectionProvider>
    <UtilityProvider>
      <PeopleProvider>
        <CallProvider>
          <NotificationProvider>
            <OffNotifyProvider>
              <SettingsProvider>
                {children}
              </SettingsProvider>
            </OffNotifyProvider>
          </NotificationProvider>
        </CallProvider>
      </PeopleProvider>
    </UtilityProvider>
  </ConnectionProvider>
);


const InnerLayout: FC = (): JSX.Element => {
  const { isMobile, hideMobileNavbar, activeColor } = useChatProvider();
  const path = useLocation().pathname;
  const { openMiniNotify, setOpenMiniNotify } = useNotificationProvider();


  //////////////////call///////////////////
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
  const initiationstate = ["ringing", "rejected", "initiated"] as CallState['status'][];
  /** -------------------------------------------------------------------------------
   * ------------------------------------------------------------------------------------------
   * ========================================================================================
   * 
   */



  return !isMobile ? (
    <div className='app_layout_container'>
      <div className="app_layout_navbar_container">
        <DesktopNavbar path={path} />
      </div>
      <div className='app_layout_content_container'>
        <MiniNotification
          isOpen={openMiniNotify}
          onClose={() => setOpenMiniNotify(false)}
        />

        <Outlet />

        {/* In call Layout, Here Because the whole app can see it, its not one page oriented  */}
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
    </div>
  ) : (
    <div className='mobile_app_layout_container'>
      <div className={`mobile_app_container ${hideMobileNavbar && "navbar_hidden"}`}>
        <Outlet />


        {/* In call Layout, Here Because the whole app can see it, its not one page oriented  */}
        {isUserInitCall && (
          <Draggable
            minHeight={500}
            minWidth={400}
            header={callHeaderText[callState?.type]}
            icon={callHeaderIcon[callState?.type]}
          >
            <MobileInCall friend={callState.receiver} />
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
            <MobileInCall friend={callState.initiator} />
          </Draggable>
        )}
      </div>
      {!hideMobileNavbar && <div style={{ background: activeColor.background }} className="mobile_app_layout_navbar_container">
        <MobileNavbar path={path} />
      </div>}
    </div>
  )
}



const AppLayout = () => (
  <AppProviders>
    <InnerLayout />
  </AppProviders>
);

export default AppLayout;
