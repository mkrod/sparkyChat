import DesktopNavbar from '@/components/app/navbar';
import { useChatProvider } from '@/constants/providers/chatProvider';
import { type FC, type JSX } from 'react'
import { Outlet } from 'react-router';
import "./css/app_layout.css";
import { ConnectionProvider } from '@/constants/providers/conn_provider';
import { UtilityProvider } from '@/constants/providers/utility_provider';

const AppLayout: FC = (): JSX.Element => {
  const { isMobile } = useChatProvider();


  return !isMobile ? (
    <ConnectionProvider>
      <UtilityProvider>
        <div className='app_layout_container'>
          <div className="app_layout_navbar_container">
            <DesktopNavbar />
          </div>
          <div className='app_layout_content_container'>
            <Outlet />
          </div>
        </div>
      </UtilityProvider>
    </ConnectionProvider>
  ) : (
    <ConnectionProvider>
      <UtilityProvider>
        <div className='mobile_app_layout_container'>
          <Outlet /> {/** Potential structure like bottom navbar */}
          Navbar
        </div>
      </UtilityProvider>
    </ConnectionProvider>
  )
}

export default AppLayout;