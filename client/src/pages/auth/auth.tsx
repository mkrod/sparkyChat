import { type FC, type JSX } from 'react';
import "./css/auth.css";
import "./css/mobile_auth.css";
import MobileAuth from './mobile/auth';
import DesktopAuth from './desktop/auth';
import { useChatProvider } from '@/constants/providers/chatProvider';

const Auth: FC = ():JSX.Element => {

  const { isMobile } = useChatProvider();


  return isMobile ? <MobileAuth /> : <DesktopAuth />;
}

export default Auth;