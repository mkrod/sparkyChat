import ActivityIndicator from '@/components/utility/activity_indicator';
import { useChatProvider } from '@/constants/providers/chatProvider'
import { useEffect, type FC, type JSX } from 'react'
import { Outlet, useNavigate, type NavigateFunction } from 'react-router';
import "./css/root_layout.css";
import { serverRequest } from '@/constants';
import type { Response } from '@/constants/types';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { MdOutlineErrorOutline } from 'react-icons/md';

const RootLayout: FC = (): JSX.Element => {
  const { activeColor, activity, setActivity, prompt } = useChatProvider();
  const navigate: NavigateFunction = useNavigate();

  ///////////////////////////////////////
  ///////////////session auth////////////////////////

  useEffect(() => {
    serverRequest("get", "session/get")
      .then((res: Response) => {
        const status = res.status;
        if (status === 200) {
          const lastPage = localStorage.getItem("last_page");
          navigate(lastPage ? lastPage : "/app");
        }else{
          navigate("/");
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
    <div style={{ background: activeColor.background, color: activeColor.text }}>
      {activity &&
        (<div className="root_activity_indicator">
          <ActivityIndicator />
        </div>)}
      <div
        style={{
          background: activeColor.background,
          boxShadow: `0 0 5px ${activeColor.fadedBorder}`
        }}
        className={`root_layout_popup_modal_container ${prompt && "popup_modal_active"}`}>
        <div className="root_layout_popup_modal_icon">
          {prompt && prompt?.type === "success" && <IoMdCheckmarkCircleOutline size={25} color='#00db00' />}
          {prompt && prompt?.type === "error" && <MdOutlineErrorOutline size={25} color='#e20000' />}
        </div>
        <div className="root_layout_popup_modal_messages">
          {prompt && prompt?.title && <span className='root_layout_popup_modal_title'>{prompt?.title}</span>}
          {prompt && prompt?.body && <span className='root_layout_popup_modal_message'>{prompt?.body}</span>}
        </div>
      </div>
      <Outlet />
    </div>
  )
}

export default RootLayout