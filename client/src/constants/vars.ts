import type { colorScheme, User } from "./types";

export const colors: Record<string, colorScheme> = {
    light: {
        background: '#ffffff',
        fadeBackground: '#f0f0f0',
        text: '#000000',
        fadedBorder: '#d8d8d85d',
        textFade: '#313131d5'
    },
    dark: {
        background: '#242424',
        fadeBackground: '#000000',
        text: '#f8f8f8de',
        fadedBorder: '#44444442',
        textFade: '#f0f0f0',
    },
}


export const defaultUserObject = {
    user_id: "Loading...",
    username: "Loading...",
    email: "Loading...",
    name: {
        first: "Loading...",
        last: "Loading...",
    },
    picture: "/default_dp.jpg",
    created_at: "Loading...",
} as User;