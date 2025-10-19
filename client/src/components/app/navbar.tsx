import { AppLogo, Appname } from '@/constants'
import { useState, type FC, type JSX } from 'react'
import "./css/navbar.css";
import { useConnProvider } from '@/constants/providers/conn_provider';
import { IoCallOutline } from 'react-icons/io5';
import { TbMessage2 } from 'react-icons/tb';
import { LuBell, LuSettings2 } from 'react-icons/lu';
import { RxUpdate } from 'react-icons/rx';
import { BiExit } from 'react-icons/bi';
import { useChatProvider } from '@/constants/providers/chatProvider';
import ActivityIndicator from '../utility/activity_indicator';

const DesktopNavbar: FC = (): JSX.Element => {
    const { user } = useConnProvider();
    const { activeColor, userScheme, switchScheme } = useChatProvider();
    const [dpIsLoading, setDpIsLoading] =  useState<boolean>(true);


  return (
    <div 
    style={{
        borderColor: activeColor.fadedBorder,
    }}
     className='app_navabr_container'>
        <div style={{borderColor: activeColor.fadedBorder}} className="app_navbar_header_container">
            <div className='app_navbar_img_container'>
                <img src={ AppLogo } alt="" className='app_nav_header_img' />
            </div>
            <span className='app_navbar_header_text'>{ Appname }</span>
        </div>

        <div className="app_navbar_user_container">
            <div className="app_navbar_user_content_container">

                <div className="app_navbar_user_picture_container">
                    {dpIsLoading && (
                        <div style={{background:activeColor.fadeBackground}} className='app_nav_header_img_skeleton'>
                            <ActivityIndicator 
                            size='small'
                            style='spin'
                            color='var(--app-accent)'
                            />
                        </div>
                    )}
                    <img onLoad={() => setTimeout(() => setDpIsLoading(false), 2000)} src={user.picture} className='app_navbar_user_picture' />
                </div>
                <div className='app_navbar_user_details_container'>
                    <div className='app_navbar_user_details_names'>
                        <span>{ user.name.first }</span>
                        <span>{ user.name.last }</span>
                    </div>
                    <span className='app_navbar_user_details_id'>{ user.email }</span>
                </div>

            </div>
            <div className="app_navbar_user_sub_section_container">
                <div className='app_navbar_user_sub_section_icon'>
                    <IoCallOutline />
                </div>
                <div className='app_navbar_user_sub_section_icon'>
                    <TbMessage2 />
                </div>
                <div className='app_navbar_user_sub_section_icon'>
                    <LuBell />
                </div>
            </div>
        </div>


        <div className="app_navbar_links_container">
            <div className="app_navbar_link_container">
                <div className='app_navbar_link_icon_container'>
                    <TbMessage2 color='green' />
                </div>
                <div className='app_navbar_link_label_container'>
                    <span className='app_navbar_label'>Chats</span>
                    <div className='app_navbar_notification_count'>88</div>
                </div>
            </div>
            <div className="app_navbar_link_container">
                <div className='app_navbar_link_icon_container'>
                    <RxUpdate color='blue' />
                </div>
                <div className='app_navbar_link_label_container'>
                    <span className='app_navbar_label'>Status</span>
                    <div className='app_navbar_notification_count'></div>
                </div>
            </div>
            <div className="app_navbar_link_container">
                <div className='app_navbar_link_icon_container'>
                    <IoCallOutline color='#940063' />
                </div>
                <div className='app_navbar_link_label_container'>
                    <span className='app_navbar_label'>Calls</span>
                    <div className='app_navbar_notification_count'></div>
                </div>
            </div>
            <div className="app_navbar_link_container">
                <div className='app_navbar_link_icon_container'>
                    <LuSettings2 color='#6400a7' />
                </div>
                <div className='app_navbar_link_label_container'>
                    <span className='app_navbar_label'>Settings</span>
                    <div className='app_navbar_notification_count'></div>
                </div>
            </div>
        </div>

        <div
        style={{borderColor: activeColor.fadedBorder}}
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