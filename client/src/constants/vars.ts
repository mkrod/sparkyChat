import type { colorScheme, User } from "./types";

export const colors: Record<string, colorScheme> = {
    light: {
        background: '#ffffff',
        fadeBackground: '#f0f0f0',
        text: '#000000',
        fadedBorder: '#d8d8d85d',
        textFade: '#313131d5',
        textFadeSecondary: '#adadad',
    },
    dark: {
        background: '#242424',
        fadeBackground: '#000000',
        text: '#f8f8f8de',
        fadedBorder: '#44444442',
        textFade: '#f0f0f0',
        textFadeSecondary: '#adadad',
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


export function formatDate(dateInput: Date | string): string {
    const date = new Date(dateInput);
    const now = new Date();
  
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
  
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  
    if (isToday) {
      // return time in 24-hour format (HH:mm)
      return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    } else if (isYesterday) {
      return "yesterday";
    } else {
      // return dd/mm/yyyy
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  }
  