import { useChatProvider } from '@/constants/providers/chatProvider'
import { type FC, type ReactNode } from 'react'
import "./css/call_home.css";
import DesktopCallList from '@/components/app/call/desktop_call_list';
import MobileCallHome from './mobile/mobile_call_home';



const CallHome: FC = (): ReactNode => {
    const { isMobile } = useChatProvider();


    return !isMobile ? (
        <div className='desktop_call_logs_container'>
            <div className="desktop_call_logs_header">
                <div className="desktop_call_logs_header_title">Call History</div>
                <div className="desktop_call_logs_header_content">

                </div>
            </div>
            <div className="desktop_call_logs_contents">
                <div className="desktop_call_logs_list_container">
                    <DesktopCallList />
                </div>
                <div className="desktop_call_logs_in_log_container">

                </div>
            </div>
        </div>
    ) : (
        <MobileCallHome />
    );
}

export default CallHome