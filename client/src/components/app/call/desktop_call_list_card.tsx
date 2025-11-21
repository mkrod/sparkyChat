import { useState, type FC, type ReactNode } from "react"
import "./css/desktop_call_list_card.css"
import type { CallLog, StartCallPayload, User } from "@/constants/types"
import ActivityIndicator from "@/components/utility/activity_indicator";
import ImageViewer from "@/components/utility/viewable_image";
import { useConnProvider } from "@/constants/providers/conn_provider";
import { formatCallTime, proxyImage } from "@/constants/var_2";
import { formatDateOnly } from "@/constants/vars";
import { useChatProvider } from "@/constants/providers/chatProvider";
import { MdOutlineCallMissed } from "react-icons/md";
import { LuPhone, LuPhoneIncoming, LuPhoneOutgoing, LuVideo } from "react-icons/lu";
import { useCallProvider } from "@/constants/providers/call_provider";
import { GiCheckMark } from "react-icons/gi";
import socket from "@/constants/socket.io/socket_conn";
import { AiOutlineAudio } from "react-icons/ai";

interface Props {
    callLog: CallLog;
}

const DesktopCallListCard: FC<Props> = (props): ReactNode => {

    const { activeColor } = useChatProvider();
    const { _id, type, initiatorId, receiverId, receiver, initiator, createdAt, endedAt, startedAt, endReason, read } = props.callLog;
    const { user_id: myId } = useConnProvider().user as User;
    const [dpIsLoading, setDpIsLoading] = useState<boolean>(true);
    const friend = initiatorId === myId ? receiver : initiator;
    const { picture, email, name, user_id } = friend;
    const { first, last } = name;
    const { callState, startCall } = useCallProvider();

    const getDuration = (): string => {
        if (!startedAt) return "0s";
        const diff = Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000);
        return formatCallTime(diff);
    }

    const getCallType = (): ReactNode => {
        let result: ReactNode = <></>;
        if (myId === initiatorId) {
            result = <LuPhoneOutgoing color="#00b600" size={18} />
        } 
        if(myId === receiverId) {
            if (endReason === "missed") {
                result = <MdOutlineCallMissed size={18} color="#ff0000" />;
            } else {
                result = <LuPhoneIncoming color="var(--app-accent)" size={18} />;
            }
        }
        if(type === "video"){
            result = <>
                {result}
                <LuVideo size={17} color="var(--app-accent)" />
            </>;
        }
        if(type === "voice"){
            result = <>
            {result}
            <AiOutlineAudio size={17} color="var(--app-accent)" />
        </>;
        }

        return result;
    }

    const getStatus = (): string => (myId === initiatorId) && endReason === "missed" ? "Not Picked" : endReason;


    const initCall = (payload: StartCallPayload) => {
        startCall(payload)
    }

    const unseenCall = !read && myId === receiver.user_id && endReason === "missed";

    const markAsSeen = () => {
        socket.emit("mark_missed_call_as_seen", { _id, myId });
    }


    return (
        <div style={{ borderColor: activeColor.fadedBorder, backgroundColor: unseenCall ? "#0060dd2f" : "" }} className="d_call_list_card">
            <div className="d_call_list_card_section name">
                <div className="d_call_list_card_user_dp_container">
                    {dpIsLoading && <div className="d_call_list_card_user_dp_loading"><ActivityIndicator color="var(--app-accent)" style="spin" /></div>}
                    {!dpIsLoading && <ImageViewer src={proxyImage(picture)} options={{ thumbnailClassName: "d_call_list_card_user_dp" }} onload={() => setDpIsLoading(false)} />}
                </div>
                <div className="d_call_list_card_user_name_container">{first + " " + last}</div>
            </div>
            <div style={{ color: activeColor.textFade }} className="d_call_list_card_section email">
                {email}
            </div>
            <div className="d_call_list_card_section time">{formatDateOnly(createdAt)}</div>
            <div style={{ color: activeColor.textFade }} className="d_call_list_card_section dur">{getDuration()}</div>
            <div style={{ color: activeColor.textFade }} className="d_call_list_card_section type">{getCallType()}</div>
            <div className="d_call_list_card_section status">
                <div className={`d_call_list_card_section_end_reason ${endReason}`}>{getStatus()}</div>
            </div>
            <div className="d_call_list_card_section action">
                <button disabled={!!callState} onClick={() => initCall({ type: "voice", receiverId: user_id })} title='Voice Call' className="in_chat_header_icon">
                    <LuPhone size={18} color='var(--app-accent)' />
                </button>
                <button disabled={!!callState} onClick={() => initCall({ type: "video", receiverId: user_id })} title='Video Call' className="in_chat_header_icon">
                    <LuVideo size={18} color='var(--app-accent)' />
                </button>
                {unseenCall &&
                    (<button style={{ cursor: "pointer" }} disabled={!!callState} onClick={markAsSeen} title='Mark as Seen' className="in_chat_header_icon">
                        <GiCheckMark size={18} color='var(--app-accent)' />
                    </button>)
                }
            </div>
        </div>
    )
}

export default DesktopCallListCard