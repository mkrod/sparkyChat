import type { CSSProperties } from "react";
import { serverURL } from ".";
import type { CallListTab, EditUser, IDLABELVALUE, NotificationSettings, NotificationSettingsText, Settings, SettingsTab, SoundsIndexKey, UserListTab } from "./types";
import { defaultNotificationSettings } from "./vars";


export const userListTabs: UserListTab[] = [
    {
        label: "Friends",
        code: "friends",
    },
    {
        label: "Add friends",
        code: "add_friends",
    },
    {
        label: "Requests",
        code: "requests",
    },
    {
        label: "Groups",
        code: "groups",
    }
]


export const proxyImage = (link: string): string => {
    return `${serverURL}/proxy?url=${encodeURIComponent(link)}`
}

export const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
        .toString()
        .padStart(1, "0");
    const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
};


export const formatCallTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);

    const parts: string[] = [];

    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);

    return parts.join(" ");
}

export const navHelper = (path: string) => {
    localStorage.setItem("last_page", path);
    return path; //essence of this is to keep track of the user last visited page so as to resume there on page reload
}


export const callTabs: CallListTab[] = [
    {
        label: "All",
        code: "all",
    },
    {
        label: "Missed",
        code: "missed",
    },
    {
        label: "Incoming",
        code: "incoming",
    },
    {
        label: "Outgoing",
        code: "outgoing",
    }
];


export const settingsTabs: SettingsTab[] = [
    {
        label: "Basic Info",
        code: "basic_info",
    },
    {
        label: "Notifications",
        code: "notifications",
    },
    {
        label: "Appearance",
        code: "appearance",
    },
    {
        label: "Call Options",
        code: "call_options",
    },
    {
        label: "Privacy & Security",
        code: "privacy_security",
    },
    {
        label: "Blocked Users",
        code: "blocked_users",
    },
    {
        label: "Sparky",
        code: "sparky",
    }
];


export const appAccentOptions: CSSProperties['background'][] = [
    "#0f74f8",
    "#00cc66",
    "#ff6600",
    "#cc00ff",
    "#ff0066",
    "#00cccc",
    "#ffcc00",
    "#cc3300",
]


export const validateFile = (file: File, allowedTypes: string[], maxSizeMB: number): { valid: boolean; error?: string } => {
    if (!allowedTypes.some(type => file.type.startsWith(type))) {
        return { valid: false, error: "Invalid file type." };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return { valid: false, error: `File size exceeds the limit of ${maxSizeMB} MB.` };
    }

    return { valid: true };
}


export const validateEditDetails = (data: EditUser): { error: boolean, message: string, filtered?: Record<string, any> } => {

    const filtered: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
        // STRING
        if (typeof value === "string") {
            if (value.trim() !== "") {
                filtered[key] = value.trim();
            }
            continue;
        }

        // OBJECT (one level)
        if (typeof value === "object" && value !== null) {
            const inner = Object.fromEntries(
                Object.entries(value).filter(([_, v]) =>
                    typeof v === "string" ? v.trim() !== "" : v === true
                )
            );

            if (Object.keys(inner).length > 0) {
                filtered[key] = inner;
            }
        }
    }

    if (Object.keys(filtered).length === 0) {
        return {
            error: true,
            message: "Atleast a Field is Required"
        };
    }

    return {
        error: false,
        message: "valid",
        filtered,
    }

}

export const notificationSettingsTexts: Record<keyof NotificationSettings, NotificationSettingsText> = {
    friend_request: {
        title: "Friend Requests",
        details: "When you receive new friend Request",
    },
    declined_request: {
        title: "Declined Requests",
        details: "When a user decline your friend request"
    },
    accepted_request: {
        title: "Accepted Requests",
        details: "When a user accept your friend Request"
    },
    unfriended: {
        title: "Unfriend",
        details: "When you are removed as a friend"
    },
}


export const notificationSoundsTexts: Record<SoundsIndexKey, NotificationSettingsText> = {
    friend_request: {
        title: "Friend Requests",
        details: "",
    },
    declined_request: {
        title: "Declined Requests",
        details: ""
    },
    accepted_request: {
        title: "Accepted Requests",
        details: ""
    },
    unfriended: {
        title: "Unfriend",
        details: ""
    },
    message: {
        title: "Message Alert",
        details: ""
    }
}



export const NotificationSounds: IDLABELVALUE[] = [
    {
        id: "1", //default
        label: "Interface",
        value: "mixkit-software-interface-start-2574.wav",
    },
    {
        id: "2",
        label: "Bell Notification",
        value: "mixkit-bell-notification.wav",
    },
    {
        id: "3",
        label: "Confirmation",
        value: "mixkit-confirmation-tone-2867.wav",
    },
    {
        id: "4",
        label: "Correct",
        value: "mixkit-correct-answer-tone-2870.wav",
    },
    {
        id: "5",
        label: "Message Pop",
        value: "mixkit-message-pop-alert-2354.mp3",
    },
    {
        id: "6",
        label: "Elevator",
        value: "mixkit-elevator-tone-2863.wav",
    },
    {
        id: "7",
        label: "Positive",
        value: "mixkit-positive-notification-951.wav",
    },
    {
        id: "8",
        label: "Sci-fi Click",
        value: "mixkit-sci-fi-click-900.wav",
    },
    {
        id: "9",
        label: "Notification Oz",
        value: "notification-18-270129.mp3",
    },
    {
        id: "10",
        label: "InterBack",
        value: "mixkit-software-interface-back-2575.wav",
    },
]


export const defaultSounds: Record<SoundsIndexKey, string> = {
    friend_request: NotificationSounds[0].value,
    declined_request: NotificationSounds[0].value,
    accepted_request: NotificationSounds[0].value,
    unfriended: NotificationSounds[0].value,
    message: NotificationSounds[0].value,
}

export const defaultSettings: Settings = {
    user_id: "Loading...",
    notification: defaultNotificationSettings
}