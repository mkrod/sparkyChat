import type { FC, JSX } from 'react'
import "./css/land.css";
import "./css/mobile_land.css"
import { useChatProvider } from '@/constants/chatProvider';
import DesktopLand from './desktop/land';
import MobileLand from './mobile/land';

const Landing: FC = (): JSX.Element => {

    const { isMobile } = useChatProvider();

    return isMobile ? <MobileLand /> : <DesktopLand />;
}

export default Landing