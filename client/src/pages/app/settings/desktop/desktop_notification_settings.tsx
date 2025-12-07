import { type FC, type ReactNode } from "react"
import "./css/desktop_notification_settings.css"
import { notificationSettingsTexts, notificationSoundsTexts } from "@/constants/var_2"
import type { NotificationSettings, SoundsIndexKey } from "@/constants/types"
import NotificationSettingsCard from "@/components/utility/notification_settings_card"
import { useNotificationProvider } from "@/constants/providers/notification_provider"
import { useChatProvider } from "@/constants/providers/chatProvider"
import NotificationSoundCard from "@/components/utility/notification_settings_sound_card"
import { useSettingsProvider } from "@/constants/providers/settings.provider"


const DesktopNotificationSettings: FC = (): ReactNode => {

  const { notificationSounds, setSound } = useNotificationProvider();
  const { activeColor } = useChatProvider();
  const { settings } = useSettingsProvider();



  return (
    <div className="d_notif_settings_container">
      <div style={{ marginBottom: "1rem" }} className="d_notif_settings_section">
        <div className="d_notif_settings_section_header">
          <span className="d_basic_settings_header_text">Notification settings</span>
          <span style={{ color: activeColor.textFadeSecondary }} className="d_basic_settings_header_sub_text">Manage your notification settings, toggle options to enable / disable setting</span>
        </div>
        <div className="d_notif_settings_section_content">
          {Object.entries(settings.notification).map(([key, value]: [string, boolean], index) => {
            const content = notificationSettingsTexts[key as keyof NotificationSettings];
            const data = {
              setting: key, value, content
            }
            return <NotificationSettingsCard key={index} data={data} />
          })}
        </div>
      </div>

      <div style={{ background: activeColor.fadedBorder }} className="border-line" />

      <div className="d_notif_settings_section">
        <div className="d_notif_settings_section_header">
          <span className="d_basic_settings_header_text">Notification Sound</span>
          <span style={{ color: activeColor.textFadeSecondary }} className="d_basic_settings_header_sub_text">Switch between sound, to alert on notification</span>
        </div>
        <div className="d_notif_settings_section_content">
          {Object.entries(notificationSounds).map(([key, value]: [string, string], index) => {
            const content = notificationSoundsTexts[key as keyof NotificationSettings];
            const data = {
              setting: key, value, content
            }
            return (
              <NotificationSoundCard
                key={index}
                data={data}
                change={(value) => setSound({ ...notificationSounds, [data.setting as SoundsIndexKey]: value })}
              />
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default DesktopNotificationSettings