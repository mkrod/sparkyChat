import { type FC, type JSX } from 'react';
import { AppLogo, Appname } from '@/constants';
import { FcGoogle } from 'react-icons/fc';

const DesktopAuth :FC = ():JSX.Element => {


  return (
    <div className='auth_container'>
        <div className="auth_header_container">
            <div className='auth_header_img_container'>
            <img src={ AppLogo } className='auth_header_img' />
            </div>
            <h4>{ Appname }</h4>
        </div>

        <div className="auth_content_container">
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

export default DesktopAuth