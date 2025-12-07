import type { FC, ReactNode } from "react"
import "./css/mini_notification.css";
import { useChatProvider } from "@/constants/providers/chatProvider";
import { FaXmark } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { useNotificationProvider } from "@/constants/providers/notification_provider";
import MiniNotificationCard from "./mini_notification_card";
import EmptyList from "../people/empty_list";
import { markAllNoteRead } from "@/constants/user/controller";

interface Props {
    isOpen: boolean;
    onClose?: () => void
}

const MiniNotification: FC<Props> = ({ isOpen, onClose = () => { } }): ReactNode => {
    const { activeColor } = useChatProvider();
    const navigate = useNavigate();
    const { miniNoteLimit, notification } = useNotificationProvider();


    return (
        <div
            style={{
                boxShadow: "0 0 2rem " + activeColor.fadeBackground,
                background: activeColor.background,
                borderColor: activeColor.fadedBorder
            }}
            className={`mini_notify_container ${isOpen ? "open" : ""}`}
        >
            <div className="mini_notify_header">
                <span>Notifications</span>
                <button
                    disabled={notification.every((n)=>n.read)}
                    onClick={markAllNoteRead}
                    style={{
                        boxShadow: "0 0 2rem " + activeColor.fadeBackground,
                    }} className="mini_notify_mark_all"
                >
                    Read all
                </button>
                <div
                    className="mini_notify_icon"
                    style={{
                        background: activeColor.fadedBorder,
                        boxShadow: "0 0 2rem " + activeColor.fadeBackground,
                    }}
                    onClick={onClose}
                >
                    <FaXmark size={12} />
                </div>
            </div>
            <div
                style={{
                    borderColor: activeColor.fadedBorder
                }}
                className="mini_notify_content"
            >
                {notification.slice(0, miniNoteLimit).map((n) => (
                    <MiniNotificationCard
                        key={n._id}
                        data={n}
                    />
                ))}
                {notification.length < 1 &&
                    <EmptyList
                        title="No New Notification"
                    />
                }
            </div>
            <div onClick={() => navigate("/app/notification")} className="mini_notify_footer mini_notify_view_all">
                View All Notification
            </div>
        </div>
    )
}

export default MiniNotification