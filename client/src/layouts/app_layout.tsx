import DesktopNavbar from '@/components/app/navbar';
import { useChatProvider } from '@/constants/providers/chatProvider';
import { type FC, type JSX } from 'react'
import { Outlet } from 'react-router';
import "./css/app_layout.css";
import { ConnectionProvider } from '@/constants/providers/conn_provider';
import { UtilityProvider } from '@/constants/providers/utility_provider';
import { PeopleProvider } from '@/constants/providers/people_provider';

const AppLayout: FC = (): JSX.Element => {
  const { isMobile } = useChatProvider();


  return !isMobile ? (
    <ConnectionProvider>
      <UtilityProvider>
        <PeopleProvider>
          <div className='app_layout_container'>
            <div className="app_layout_navbar_container">
              <DesktopNavbar />
            </div>
            <div className='app_layout_content_container'>
              <Outlet />
            </div>
          </div>
        </PeopleProvider>
      </UtilityProvider>
    </ConnectionProvider>
  ) : (
    <ConnectionProvider>
      <UtilityProvider>
        <PeopleProvider>
          <div className='mobile_app_layout_container'>
            <Outlet /> {/** Potential structure like bottom navbar */}
            Navbar
          </div>
        </PeopleProvider>
      </UtilityProvider>
    </ConnectionProvider>
  )
}

export default AppLayout;