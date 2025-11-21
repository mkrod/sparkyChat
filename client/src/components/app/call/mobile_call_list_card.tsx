import ActivityIndicator from "@/components/utility/activity_indicator"
import { useState, type FC, type ReactNode } from "react";
import "./css/mobile_call_list_card.css";
import { useChatProvider } from "@/constants/providers/chatProvider";
import type { CallLog, StartCallPayload, User } from "@/constants/types";
import { useConnProvider } from "@/constants/providers/conn_provider";
import { formatDateOnly } from "@/constants/vars";
import { LuPhone, LuPhoneIncoming, LuPhoneOutgoing, LuVideo } from "react-icons/lu";
import { MdOutlineCallMissed } from "react-icons/md";
import { AiOutlineAudio } from "react-icons/ai";
import { GiCheckMark } from "react-icons/gi";
import { useCallProvider } from "@/constants/providers/call_provider";
import socket from "@/constants/socket.io/socket_conn";
import { formatCallTime, proxyImage } from "@/constants/var_2";

interface Props {
    data: CallLog;
}

const MobileListCallCard: FC<Props> = (prop): ReactNode => {

    const { _id, initiatorId, receiverId, createdAt, endReason, type, read, receiver, startedAt, endedAt } = prop.data;
    const [dpIsLoading, setDpIsLoading] = useState<boolean>(true);
    const { activeColor } = useChatProvider();
    const { user_id: myId } = useConnProvider().user;
    const { callState, startCall } = useCallProvider();
    const { name, picture, user_id } = myId === initiatorId ? prop.data.receiver : prop.data.initiator as User;
    const getIcon = (): ReactNode => {
        let result: ReactNode = <></>;
        if (myId === initiatorId) {
            result = <LuPhoneOutgoing color="#00b600" size={12} />
        }
        if (myId === receiverId) {
            if (endReason === "missed") {
                result = <MdOutlineCallMissed size={12} color="#ff0000" />;
            } else {
                result = <LuPhoneIncoming color="var(--app-accent)" size={12} />;
            }
        }
        if (type === "video") {
            result = <>
                {result}
                <LuVideo size={12} color="var(--app-accent)" />
            </>;
        }
        if (type === "voice") {
            result = <>
                {result}
                <AiOutlineAudio size={12} color="var(--app-accent)" />
            </>;
        }

        return result;
    }
    const initCall = (payload: StartCallPayload) => {
        startCall(payload)
    }
    const unseenCall = !read && myId === receiver.user_id && endReason === "missed";

    const markAsSeen = () => {
        socket.emit("mark_missed_call_as_seen", { _id, myId });
    }
    const getDuration = (): string => {
        if (!startedAt) return "0s";
        const diff = Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000);
        return formatCallTime(diff);
    }

    return (
        <div style={{ backgroundColor: unseenCall ? "#0060dd2f" : "" }} className="m_list_call_card_container">
            <div className="m_list_call_card_left">
                <div style={{ background: activeColor.fadedBorder }} className="m_list_call_card_dp_container">
                    {dpIsLoading && (
                        <div style={{ position: "absolute", height: "100%", width: "!00%", display: "flex", alignItems: "center", justifyContent: "content" }}>
                            <ActivityIndicator style="spin" />
                        </div>
                    )}
                    <img src={proxyImage(picture)} className="m_list_call_card_dp" onLoad={() => setDpIsLoading(false)} />
                </div>
            </div>
            <div className="m_list_call_card_center">
                <div className="m_list_call_card_center_top">
                    {name.first + " " + name.last}
                </div>
                <div className="m_list_call_card_center_bottom">
                    <div className="m_list_call_card_center_bottom_icon">
                        {getIcon()}
                    </div>
                    <div style={{ color: activeColor.textFadeSecondary }} className="m_list_call_card_center_bottom_timestamp">
                        {formatDateOnly(createdAt)}
                    </div>
                </div>
            </div>
            <div className="m_list_call_card_right">
                <div style={{ color: activeColor.textFadeSecondary }} className="m_list_call_card_right_duration">
                    {getDuration()}
                </div>
                <div className="m_list_call_card_right_icons">
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
        </div>
    )
}

export default MobileListCallCard