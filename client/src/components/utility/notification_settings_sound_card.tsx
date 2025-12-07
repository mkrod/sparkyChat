import { type FC } from "react"
import "./css/notification_settings_card.css"
import type { NotificationSettingsText } from "@/constants/types"
import { useChatProvider } from "@/constants/providers/chatProvider"
import Dropdown from "./dropdown"
import { NotificationSounds } from "@/constants/var_2"

interface Props {
    data: { setting: string, value: string, content: NotificationSettingsText };
    change: (value:string)=>void;
}

const NotificationSoundCard: FC<Props> = ({ data, change }) => {

    const { value, content } = data;
    const { title, details } = content;
    const { activeColor } = useChatProvider();


    return (
        <div
            style={{
                borderColor: activeColor.fadedBorder
            }} className="d_notif_settings_card"
        >
            <div className="d_notif_settings_card_content">
                <span className="d_notif_settings_card_title">{title}</span>
                <span style={{ color: activeColor.textFade }} className="d_notif_settings_card_details">{details}</span>
            </div>
            <div className="d_notif_settings_card_value">
                <Dropdown
                 data={NotificationSounds}
                 selectedValue={value}
                 onSelect={change}
                />
            </div>
        </div>
    )
}

export default NotificationSoundCard