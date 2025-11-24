import { useChatProvider } from "@/constants/providers/chatProvider"
import { useEffect, useState, type CSSProperties, type FC, type ReactNode } from "react"
import "./css/desktop_appearance.css";
import { appAccentOptions } from "@/constants/var_2";


const DesktopAppearance: FC = (): ReactNode => {

    const { activeColor, setAccent } = useChatProvider();
    const [currentAccent, setCurrentAccent] = useState<string>("#0f74f8");

    // Load saved accent once
    useEffect(() => {
        const stored = localStorage.getItem("app-accent");
        if (stored) setCurrentAccent(stored);
    }, []);

    // When user selects a new color
    const handleAccentChange = (color: string) => {
        setAccent(color);                 // updates CSS variable + saves to localStorage (your provider)
        setCurrentAccent(color);          // update UI immediately
    };

    return (
        <div className="d_settings_appearance_container">
            <div className="d_settings_appearance_section">
                <div className="d_settings_appearance_section_header">
                    <span style={{ color: activeColor.text, fontSize: "1rem" }}>Theme Color</span>
                    <span style={{ color: activeColor.textFadeSecondary, fontWeight: 500 }}>Personalize the app with your favourite color palette</span>
                </div>
                <div className="d_settings_appearance_section_content">
                    <div className="d_settings_appearance_section_content_colors">
                        {appAccentOptions.map((color: CSSProperties['background'], index) => (
                            <div
                                style={{
                                    borderColor: color === currentAccent ? "var(--app-accent)" : "transparent",
                                }}
                                className="d_settings_appearance_section_content_colors_item_container"
                                onClick={() => handleAccentChange(color as string)}
                            >
                                <div
                                    key={index}
                                    style={{
                                        background: color,
                                        borderRadius: "50%",
                                        height: "2rem",
                                        width: "2rem",
                                        cursor: "pointer",
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="d_settings_appearance_section_content_custom_color">

                    </div>
                </div>
            </div>
        </div>
    )
}

export default DesktopAppearance