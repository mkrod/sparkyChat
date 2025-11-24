import type { CSSProperties } from "react";
import { serverURL } from ".";
import type { CallListTab, SettingsTab, UserListTab } from "./types";


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