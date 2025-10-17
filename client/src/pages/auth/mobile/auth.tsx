import { AppLogo, Appname } from '@/constants'
import { type FC, type JSX } from 'react'
import { FcGoogle } from 'react-icons/fc'

const MobileAuth :FC = (): JSX.Element => {


  return (
    <div className='mobile_auth_container'>
        <div className="mobile_auth_header_container">
            <div className='auth_header_img_container'>
                <img src={ AppLogo } className='auth_header_img' />
            </div>
            <h4>{ Appname }</h4>
        </div>

        <div className="mobile_auth_content_container">
            <h2>Sign in into your account</h2>

            <div className='auth_signin_options_container'>
                <button className='auth_signin_options'>
                    <FcGoogle size={20}/>
                    <span>Continue with google</span>
                </button>
            </div>
        </div>
    </div>
  )
}

export default MobileAuth