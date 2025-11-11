import DesktopNavbar from '@/components/app/navbar';
import { useChatProvider } from '@/constants/providers/chatProvider';
import { type FC, type JSX } from 'react'
import { Outlet, useLocation } from 'react-router';
import "./css/app_layout.css";
import { ConnectionProvider } from '@/constants/providers/conn_provider';
import { UtilityProvider } from '@/constants/providers/utility_provider';
import { PeopleProvider } from '@/constants/providers/people_provider';
import { CallProvider } from '@/constants/providers/call_provider';
import MobileNavbar from '@/components/app/mobile/navbar';
import { NotificationProvider } from '@/constants/providers/notification_provider';

const AppLayout: FC = (): JSX.Element => {
  const { isMobile, hideMobileNavbar, activeColor } = useChatProvider();
  const path = useLocation().pathname;


  return !isMobile ? (
    <ConnectionProvider>
      <UtilityProvider>
        <PeopleProvider>
          <CallProvider>
            <NotificationProvider>
              <div className='app_layout_container'>
                <div className="app_layout_navbar_container">
                  <DesktopNavbar path={path} />
                </div>
                <div className='app_layout_content_container'>
                  <Outlet />
                </div>
              </div>
            </NotificationProvider>
          </CallProvider>
        </PeopleProvider>
      </UtilityProvider>
    </ConnectionProvider>
  ) : (
    <ConnectionProvider>
      <UtilityProvider>
        <PeopleProvider>
          <CallProvider>
            <NotificationProvider>
              <div className='mobile_app_layout_container'>
                <div className={`mobile_app_container ${hideMobileNavbar && "navbar_hidden"}`}>
                  <Outlet />
                </div>
                {!hideMobileNavbar && <div style={{ background: activeColor.background }} className="mobile_app_layout_navbar_container">
                  <MobileNavbar path={path} />
                </div>}
              </div>
            </NotificationProvider>
          </CallProvider>
        </PeopleProvider>
      </UtilityProvider>
    </ConnectionProvider>
  )
}

export default AppLayout;