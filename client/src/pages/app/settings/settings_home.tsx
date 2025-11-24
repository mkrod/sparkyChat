import { type FC, type ReactNode } from 'react'
import "./css/settings_home.css"
import MobileSettingsHome from './mobile/mobile_settings_home'
import DesktopSettingsHome from './desktop/desktop_settings_home'
import { useChatProvider } from '@/constants/providers/chatProvider'


const SettingsHome: FC = (): ReactNode => {
    const { isMobile } = useChatProvider();

    return isMobile ? <MobileSettingsHome /> : <DesktopSettingsHome />;
}

export default SettingsHome