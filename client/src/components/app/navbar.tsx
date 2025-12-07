import { AppLogo, Appname, serverURL } from '@/constants'
import { useState, type FC, type JSX } from 'react'
import "./css/navbar.css";
import { useConnProvider } from '@/constants/providers/conn_provider';
import { TbUserBolt } from 'react-icons/tb';
import { LuBell, LuPhone } from 'react-icons/lu';
import { BiExit } from 'react-icons/bi';
import { useChatProvider } from '@/constants/providers/chatProvider';
import ActivityIndicator from '../utility/activity_indicator';
import { useNotificationProvider } from '@/constants/providers/notification_provider';
import { NavLinks } from '@/constants/vars';
import type { NotificationCountsIndex } from '@/constants/types';
import { useNavigate } from 'react-router';
import ImageViewer from '../utility/viewable_image';
import { navHelper } from '@/constants/var_2';


type Props = { path: string }

const DesktopNavbar: FC<Props> = ({ path }): JSX.Element => {

    const { user } = useConnProvider();
    const { activeColor, userScheme, switchScheme } = useChatProvider();
    const [dpIsLoading, setDpIsLoading] = useState<boolean>(true);
    const { notificationCounts, openMiniNotify, setOpenMiniNotify } = useNotificationProvider();
    const order = ["Chats", "Spark", "Calls", "Settings"];
    const navlinks = NavLinks.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    const navigate = useNavigate();




    return (
        <div
            style={{
                borderColor: activeColor.fadedBorder,
            }}
            className='app_navabr_container'>
            <div style={{ borderColor: activeColor.fadedBorder }} className="app_navbar_header_container">
                <div className='app_navbar_img_container'>
                    <img src={AppLogo} alt="" className='app_nav_header_img' />
                </div>
                <span className='app_navbar_header_text'>{Appname}</span>
            </div>

            <div className="app_navbar_user_container">
                <div className="app_navbar_user_content_container">

                    <div className="app_navbar_user_picture_container">
                        {dpIsLoading && (
                            <div style={{ background: activeColor.fadeBackground }} className='app_nav_header_img_skeleton'>
                                <ActivityIndicator
                                    size='small'
                                    style='spin'
                                    color='var(--app-accent)'
                                />
                            </div>
                        )}
                        <ImageViewer
                            src={`${serverURL}/proxy?url=${encodeURIComponent(user.picture)}`}
                            options={{
                                thumbnailClassName: "app_navbar_user_picture",
                                height: "100%",
                                width: "100%",
                                rounded: true
                            }}
                            onload={() => setTimeout(() => setDpIsLoading(false), 2000)}
                        />
                        {/*<img onLoad={() => setTimeout(() => setDpIsLoading(false), 2000)} src={`${serverURL}/proxy?url=${encodeURIComponent(user.picture)}`} className='app_navbar_user_picture' />*/}
                    </div>
                    <div className='app_navbar_user_details_container'>
                        <div className='app_navbar_user_details_names'>
                            <span>{user.name.first}</span>
                            <span>{user.name.last}</span>
                        </div>
                        <span className='app_navbar_user_details_id'>{user.email}</span>
                    </div>

                </div>
                <div className="app_navbar_user_sub_section_container">
                    <div className='app_navbar_user_sub_section_icon'>
                        <LuPhone />
                    </div>
                    <div className='app_navbar_user_sub_section_icon'>
                        <TbUserBolt />
                        {notificationCounts["friends_request"] > 0 &&
                            (
                                <div className="app_navbar_user_sub_section_icon_note_count">
                                    {notificationCounts["friends_request"]}
                                </div>
                            )
                        }
                    </div>
                    <div onClick={() => setOpenMiniNotify(!openMiniNotify)} className='app_navbar_user_sub_section_icon'>
                        <LuBell />
                        {notificationCounts["base"] > 0 &&
                            (
                                <div className="app_navbar_user_sub_section_icon_note_count">
                                    {notificationCounts["base"]}
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>


            <div className="app_navbar_links_container">
                {navlinks.map((bar, index) => (
                    <div
                        onClick={() => navigate(navHelper(bar.path))}
                        key={index}
                        className="app_navbar_link_container"
                    >
                        {(bar.path !== "/app" ? path.startsWith(bar.path) : path === bar.path) && <div className='app_navbar_link_active'></div>}
                        <div className='app_navbar_link_icon_container'>
                            {bar.icon}
                        </div>
                        <div className='app_navbar_link_label_container'>
                            <span className='app_navbar_label'>{bar.name}</span>
                            {notificationCounts[bar.name.toLowerCase() as NotificationCountsIndex] > 0 &&
                                (
                                    <div className="app_navbar_notification_count">
                                        {notificationCounts[bar.name.toLowerCase() as NotificationCountsIndex]}
                                    </div>
                                )
                            }
                        </div>
                    </div>
                ))}
            </div>

            <div
                style={{ borderColor: activeColor.fadedBorder }}
                className='app_navbar_footer'>

                <div className="app_navbar_theme_container">
                    <span>Dark Mode</span>
                    <label className="app_navbar_theme_switch">
                        <input checked={userScheme === "dark"}
                            onChange={switchScheme}
                            type='checkbox' className="app_navbar_theme_checkbox" />
                        <div className="app_navbar_theme_slider"></div>
                    </label>
                </div>

                <div className="app_navbar_link_container">
                    <div className='app_navbar_link_icon_container'>
                        <BiExit color='red' />
                    </div>
                    <div className='app_navbar_link_label_container'>
                        <span className='app_navbar_label'>Logout</span>
                        <div className='app_navbar_notification_count'></div>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default DesktopNavbar