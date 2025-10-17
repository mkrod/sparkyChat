import { type FC, type JSX } from 'react'
import { Outlet } from 'react-router';
import "./css/auth_layout.css";
import { useChatProvider } from '@/constants/chatProvider';

const AuthLayout : FC = (): JSX.Element => {
    const { isMobile } = useChatProvider();

  return isMobile ? (
    <div className='mobile_auth_layout_container'>
        <Outlet />
    </div>
          
     ) : (
    <div className='auth_layout_container'>
        <div className="auth_layout_content_container">
            <Outlet />
        </div>

        <div className="auth_layout_shared_container">
            <div className="auth_layout_shared_header_text_container">
                <span>An effcicent and better way to </span>
                <span>Connect with people all over the world</span>
            </div>
            <div className="auth_layout_shared_desc_text_container">
                <span>modern technology </span>
                <span>Supports to grow faster</span>
            </div>
        </div>
    </div>
  );
}

export default AuthLayout