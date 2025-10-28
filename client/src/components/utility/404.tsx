import React from 'react'
import "./css/404.css";

const NotFound : React.FC = () : React.JSX.Element => {


  return (
    <div className='not_found_container'>
        <img src='/404_error_image.png' width={300} />
        <h1 className='not_found_big_text'>Page not found...</h1>
        <span className='not_found_caption'>Sorry, the page you are looking for doesn't exist or has been moved.</span>
    </div>
  )
}

export default NotFound