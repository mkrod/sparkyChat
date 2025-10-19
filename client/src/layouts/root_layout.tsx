import ActivityIndicator from '@/components/utility/activity_indicator';
import { useChatProvider } from '@/constants/providers/chatProvider'
import {useEffect, type FC, type JSX} from 'react'
import { Outlet, useNavigate, type NavigateFunction } from 'react-router';
import "./css/root_layout.css";
import { serverRequest } from '@/constants';
import type { Response } from '@/constants/types';

const RootLayout:FC = ():JSX.Element => {
  const { activeColor, activity, setActivity } = useChatProvider();
  const navigate: NavigateFunction = useNavigate();

  ///////////////////////////////////////
  ///////////////session auth////////////////////////

  useEffect(() => {
    serverRequest("get", "session/get")
    .then((res: Response) => {
      const status = res.status;
      if(status === 200){
        navigate("/app");
      }
    })
    .catch((err: Error) => {
      console.log("Error checking session: ", err);
    })
    .finally(() => {
      setTimeout(() => setActivity(false), 1000);
    });
  }, []);

  ///////////////////////////
  ///////////////////////////
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