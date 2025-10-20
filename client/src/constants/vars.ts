import type { RefObject } from "react";
import type { colorScheme, NotificationCounts, User } from "./types";

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


export const saveCaret = (window: Window, caretPosRef: RefObject<number | null>) => {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    caretPosRef.current = range.startOffset;
  }
};

export const restoreCaret = (window: Window, caretPosRef: RefObject<number | null>, inputRef: RefObject<HTMLDivElement | null>) => {
      const node = inputRef.current;
      if (node && caretPosRef.current !== null) {
        const sel = window.getSelection();
        const range = document.createRange();
        range.setStart(node.firstChild || node, caretPosRef.current);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
};

export const scrollElementToBottom = (obj: RefObject<HTMLElement|null>) => {
  if(!obj.current) return;
  const element = obj.current;
  element.scrollTop = element.scrollHeight;
  element.onscroll = () =>{
    console.log("Top: ", element.scrollTop)
    console.log("Scroll Height", element.scrollHeight)
    console.log("Height", element.style.height)
 }
}

export const defaultNotificationCounts: NotificationCounts = {
    messages: 0,
    calls: 0,
    alerts: 0,
}