import ActivityIndicator from '@/components/utility/activity_indicator';
import { useChatProvider } from '@/constants/chatProvider'
import {type FC, type JSX} from 'react'
import { Outlet } from 'react-router';
import "./css/root_layout.css";

const RootLayout:FC = ():JSX.Element => {
  const { activeColor, activity } = useChatProvider();
  //console.log(activeColor)
  return (
    <div style={{background: activeColor.background, color: activeColor.text}}>
      {activity &&
       (<div className="root_activity_indicator">
        <ActivityIndicator />
      </div>)}
      <Outlet />
    </div>
  )
}

export default RootLayout