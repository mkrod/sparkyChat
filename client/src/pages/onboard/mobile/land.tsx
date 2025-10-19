import { Appname } from '@/constants'
import { useChatProvider } from '@/constants/providers/chatProvider'
import { useState, type FC, type JSX} from 'react'
import { HiMiniBars3CenterLeft } from 'react-icons/hi2'
import { IoClose } from 'react-icons/io5'
import { MdOutlineTouchApp } from 'react-icons/md'
import { useNavigate } from 'react-router'

const MobileLand: FC = (): JSX.Element => {

  const { activeColor } = useChatProvider();
  const [openNav, setOpenNav] =  useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <div className='mobile_land_container'>
      <div className="mobile_land_header">
        <div className="mobile_land_header_left">
          <img src="/logo.png" alt="logo" height={70} width={70} />
          <h4>{ Appname }</h4>
        </div>
        <div
         onClick={() => setOpenNav(true)}
         className="mobile_land_header_right">
          <HiMiniBars3CenterLeft size={35} />
        </div>


        {/* navbar */}
        
          <div style={{backgroundColor: activeColor.background}} 
              className={`mobile_land_navbar_container ${openNav ? 'show' : ''}`}>
            <div 
            onClick={() => setOpenNav(false)}
            className="mobile_land_navbar_close">
              <IoClose size={35} />
            </div>

            <div className="mobile_land_navbar_links">
              <div className="mobile_land_navbar_link">Home</div>
              <div className="mobile_land_navbar_link">About { Appname }</div>
              <div className="mobile_land_navbar_link">Support</div>
              <div className="mobile_land_navbar_link">Contact</div>
              <div 
              onClick={() => navigate("/auth")}
              className="mobile_land_navbar_link">Get Started</div>
            </div>
          </div>
      </div>


      <div className="mobile_land_content_container">
        <div className="mobile_land_content_first">
          <span>Your new way of</span>
          <div className="land_first_content_center_container communication">
              <span className="">communication</span> 
          </div>
        </div>

        <div className="mobile_land_content_second">
          <div className='mobile_land_content_img_container normal'>
            <img src="/images_potr_4.jpeg" height={250} className='mobile_land_content_img' />
          </div>
        </div>

        <div className="mobile_land_content_third">
            <span>Stay connected with people with same interest anywhere around the world</span>
            <span>Be free to speak in group chat with upto 10 people</span>
        </div>

        <div className="mobile_land_content_second">
          <div className='mobile_land_content_img_container normal'>
            <img src="/images_potr_2.jpeg" height={250} className='mobile_land_content_img' />
          </div>
        </div>


        <div className="mobile_land_content_third">
          <button 
          onClick={() => navigate("/auth")}
          className='land_first_content_center_button' >
          Get Started
          <MdOutlineTouchApp size={15} />
          </button>
        </div>

        <div className="mobile_land_content_second">
          <div className='mobile_land_content_img_container wide'>
            <img src="/images_wide.jpeg" height={220} width="99%" className='mobile_land_content_img' />
          </div>
        </div>




      </div>
    </div>
  )
}

export default MobileLand