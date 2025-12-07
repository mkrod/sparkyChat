import { useState, type FC } from "react"
import "./css/notification_settings_card.css"
import type { NotificationSettingsText } from "@/constants/types"
import { useChatProvider } from "@/constants/providers/chatProvider"
import ActivityIndicator from "./activity_indicator"
import { updateSettings } from "@/constants/user/controller"
import { useSettingsProvider } from "@/constants/providers/settings.provider"

interface Props {
    data: { setting: string, value: boolean, content: NotificationSettingsText }
}

const NotificationSettingsCard: FC<Props> = ({ data }) => {

    const { setting, value, content } = data;
    const { title, details } = content;
    const { activeColor, setPrompt } = useChatProvider();
    const { setFetchingSettings } = useSettingsProvider();
    const [updating, setUpdating] = useState<boolean>(false);


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
                {!updating && (
                    <div
                        onClick={() => {
                            if(updating) return;
                            setUpdating(true);
                            updateSettings({ notification: {[setting]: !value }})
                            .then(()=> {
                                setFetchingSettings(true);
                            })
                            .catch(() => {
                                //console.log("Cannot Update Notification Setting: ", err);
                                setPrompt({ type: "error", title: "error updating setting" });
                            })
                            .finally(() => {
                                setTimeout(() => setUpdating(false), 1000);
                            })
                        }}
                        className="d_basic_settings_field_switch_container"
                    >
                        <input
                            type="checkbox"
                            className="d_basic_settings_field_switch"
                            checked={value}
                            onChange={() => { }}
                        />
                        <span className="d_basic_settings_field_switch_slider"></span>
                    </div>
                )}
                {updating && (
                    <div style={{ display: "flex", height: "2rem", alignItems: "center" }}>
                        <ActivityIndicator style="spin" color="var(--app-accent)" />
                    </div>
                )}
            </div>
        </div>
    )
}

export default NotificationSettingsCard