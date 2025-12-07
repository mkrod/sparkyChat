import type { Notification } from "@/constants/types";
import { type FC, type ReactNode } from "react";
import "./css/mini_notification_card.css";
import { LuBell } from "react-icons/lu";
import { useChatProvider } from "@/constants/providers/chatProvider";
import { formatDate } from "@/constants/vars";


interface Props {
    data: Notification;
}

const MiniNotificationCard: FC<Props> = ({ data }): ReactNode => {
    const { type, title, content, createdAt, read, metadata } = data;
    const { activeColor } = useChatProvider();



    const Content = (type: Notification["type"]): ReactNode => {
        switch (type) {
            case "others":
                return (
                    <div style={{ borderColor: activeColor.fadedBorder }} className="mini_note_container">
                        <div className="mini_note_left_container">
                            <div style={{ background: "var(--app-accent)" }} className="mini_note_picture_container">
                                <LuBell size={20} />
                            </div>
                        </div>
                        <div className="mini_note_content_container">
                            <div style={{ color:  activeColor.text }} className="mini_note_content_title">
                                {title}
                            </div>
                            <div style={{ color: activeColor.textFade }} className="mini_note_content">
                                {content}
                            </div>
                        </div>
                        <div className="mini_note_metadata_container">
                            <div className="mini_note_metadata_date">
                                {formatDate(createdAt)}
                            </div>
                            {!read && <div className="mini_note_metadata_unread" />}
                        </div>
                    </div>
                );
            default:
                return (
                    <div style={{ borderColor: activeColor.fadedBorder }} className="mini_note_container">
                        <div className="mini_note_left_container">
                            <div className="mini_note_picture_container">
                                <img
                                    src={metadata?.friend?.picture || undefined}
                                    className="mini_note_picture"
                                />
                            </div>
                        </div>
                        <div className="mini_note_content_container">
                            <div style={{ color: activeColor.text }} className="mini_note_content_title">
                                {title}
                            </div>
                            <div style={{ color: activeColor.textFade }} className="mini_note_content">
                                {content}
                            </div>
                        </div>
                        <div className="mini_note_metadata_container">
                            <div className="mini_note_metadata_date">
                                {formatDate(createdAt)}
                            </div>
                            {!read && <div className="mini_note_metadata_unread" />}
                        </div>
                    </div>
                );
        }
    }

    return Content(type);
}

export default MiniNotificationCard