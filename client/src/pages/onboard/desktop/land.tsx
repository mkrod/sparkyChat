import type { FC, JSX } from 'react'
import { AppLogo, Appname } from '@/constants'
import { useChatProvider } from '@/constants/providers/chatProvider';
import { MdOutlineTouchApp } from 'react-icons/md';
import { useNavigate, type NavigateFunction } from 'react-router';


const DesktopLand: FC = (): JSX.Element => {

    const { activeColor } = useChatProvider();
    const navigate: NavigateFunction = useNavigate();

  return (
    <div className='land_container'>
        <div className='land_navbar_container'>
            <div className="land_navbar_left_container">
                <div className='land_navbar_img_container'>
                    <img src={ AppLogo } alt="" className='land_nav_img' />
                </div>
                <h3 className='land_navbar'>{ Appname }</h3>
            </div>

            <div className="land_navbar_nav_container">
                <div className="land_nav">
                    Home
                </div>
                <div className="land_nav">
                    About { Appname }
                </div>
                <div className="land_nav">
                    Support
                </div>
                <div className="land_nav">
                    Contact
                </div>
                
            </div>

            <div className="land_navbar_right_container">
                <button
                onClick={() => navigate("/auth")}
                style={{background: activeColor.background}} className='land_navbar_button'>
                    <div className='land_nav_button_text'>Get Started</div>
                </button>
            </div>
        </div>

        <div className="land_content_container">
            <div className="land_first_content_container">

                <div className="land_first_content_left">
                    <div className="land_content_card_container left_top">
                        <img height={200} src="/images_potr.jpeg" className='land_content_card_img' />
                    </div>

                    <div className="land_content_card_container left_top">
                        <img height={200} src="/images_potr_3.jpeg" className='land_content_card_img' />
                    </div>
                </div>

                <div className="land_first_content_center">
                    <div className="land_first_content_center_container">
                        <span>Your new way of</span>
                    </div>
                    <div className="land_first_content_center_container communication">
                        <span className="">communication</span> 
                    </div>
                    <div className='land_first_content_center_description_container'>
                        <span>Stay connected with people with same interest anywhere around the world</span>
                    </div>
                    <div className='land_first_content_center_description_container'>
                        <span>Be free to speak in group chat with upto 10 people</span>
                    </div>

                    <div className='land_first_content_center_button_container'>
                        <button 
                        onClick={() => navigate("/auth")}
                        className='land_first_content_center_button' >
                        Get Started
                        <MdOutlineTouchApp size={15} />
                        </button>
                    </div>

                    <div className="land_content_card_container wide">
                        <img src="/images_wide.jpeg" className='land_content_card_img' />
                    </div>

                </div>

                <div className="land_first_content_right">
                    <div className="land_content_card_container left_top">
                        <img height={200} src="/images_potr_2.jpeg" className='land_content_card_img' />
                    </div>

                    <div className="land_content_card_container left_top">
                        <img height={200} src="/images_potr_4.jpeg" className='land_content_card_img' />
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default DesktopLand