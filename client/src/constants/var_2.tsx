import { serverURL } from ".";
import type { UserListTab } from "./types";

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