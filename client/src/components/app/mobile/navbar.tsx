import { type FC, type JSX } from 'react';
import "./css/navbar.css";
import { useChatProvider } from '@/constants/providers/chatProvider';
import { NavLinks } from '@/constants/vars';
import { useNavigate } from 'react-router';
import { useNotificationProvider } from '@/constants/providers/notification_provider';
import type { NotificationCountsIndex } from '@/constants/types';


type Props = { path: string }
const MobileNavbar: FC<Props> = ({ path }): JSX.Element => {

    const { activeColor } = useChatProvider();
    const navigate = useNavigate();
    const { notificationCounts } = useNotificationProvider();


    return (
        <div
            style={{
                borderTopColor: activeColor.fadedBorder
            }}
            className='mobile_navbar_container'
        >
            {NavLinks.map((bar, index) => (
                <div
                    onClick={() => navigate(bar.path)}
                    key={index}
                    className="mobile_navbar"
                >
                    <div className="mobile_navbar_icon">
                        {bar.icon}
                    </div>
                    <div
                        style={{ 
                            color: path.startsWith(bar.path) ? "var(--app-accent)" : "",
                            fontWeight: path.startsWith(bar.path) ? "bolder" : 600,
                            fontSize: path.startsWith(bar.path) ? "0.8rem" : "0.6rem"
                        }}
                        className="mobile_navbar_text"
                    >
                        {bar.name}
                    </div>
                    {notificationCounts[bar.name.toLowerCase() as NotificationCountsIndex] > 0 &&
                        (
                            <div className="mobile_navbar_notify">
                                {notificationCounts[bar.name.toLowerCase() as NotificationCountsIndex]}
                            </div>
                        )
                    }
                </div>
            ))}
        </div>
    )
}

export default MobileNavbar