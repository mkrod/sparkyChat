import { serverURL } from ".";
import type { UserListTab } from "./types";
import { countFriendsRequest } from "./user/controller";

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
        count: countFriendsRequest(),
    },
    {
        label: "Groups",
        code: "groups",
    }
]


export const proxyImage = (link: string): string => {
    return `${serverURL}/proxy?url=${encodeURIComponent(link)}`
}