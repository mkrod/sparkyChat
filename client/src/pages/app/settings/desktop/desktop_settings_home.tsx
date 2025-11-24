import { useState, type FC, type ReactNode } from "react"
import "./css/desktop_settings_home.css"
import { settingsTabs } from "@/constants/var_2"
import DesktopAppearance from "./desktop_appearance";
import type { SettingsTab } from "@/constants/types";
import { useChatProvider } from "@/constants/providers/chatProvider";
import DesktopBasicSettings from "./desktop_basic_settings";
import DesktopNotificationSettings from "./desktop_notification_settings";


const DesktopSettingsHome: FC = (): ReactNode => {

    const { activeColor } = useChatProvider();
    const defaultTabCode: SettingsTab["code"] = "basic_info";
    const defaultTabIndex: number = settingsTabs.findIndex(tab => tab.code === defaultTabCode) || 0;
    const [activeTab, setActiveTab] = useState<SettingsTab["code"]>(settingsTabs[defaultTabIndex].code);
    const isActive = (tabCode: SettingsTab["code"]) => activeTab === tabCode;

    return (
        <div className="d_settings_container">
            <div className="d_settings_header">
                <div className="d_settings_header_left">
                    <span>Settings</span>
                </div>
                <div className="d_settings_header_right">
                    {/* Search bar etc */}
                </div>
            </div>
            <div style={{ borderColor: activeColor.fadedBorder }} className="d_settings_tabs">
                {settingsTabs.map((tab, index) => (
                    <div
                        onClick={() => setActiveTab(tab.code)}
                        className={`d_settings_tab ${isActive(tab.code) ? "active" : ""}`}
                        key={index}
                        style={{
                            color: isActive(tab.code) ? "var(--app-accent)" : activeColor.textFade,
                        }}
                    >
                        <span>{tab.label}</span>
                    </div>
                ))}
            </div>

            <div className="d_settings_content">
                {activeTab === "basic_info" && <DesktopBasicSettings />}
                {activeTab === "appearance" && <DesktopAppearance />}
                {activeTab === "notifications" && <DesktopNotificationSettings />}
                {/* Add other tabs content here */}
            </div>
        </div>
    )
}

export default DesktopSettingsHome