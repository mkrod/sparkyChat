import type { ReactNode, RefObject } from "react";
import type { colorScheme, GroupedMessages, Message, NotificationCountsIndex, Presence, PreviewMediaData, User } from "./types";
import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";
import { RxUpdate } from "react-icons/rx";
import { LuPhone, LuSettings2 } from "react-icons/lu";
import { TbMessage2 } from "react-icons/tb";

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

export const NavLinks = [
  {
      name: "Status",
      icon: <RxUpdate color='blue' size={18} />,
      path: "/app/status",
  },
  {
      name: "Calls",
      icon: <LuPhone color='#940063' size={18} />,
      path: "/app/calls",
  },
  {
      name: "Chats",
      icon: <TbMessage2 color='green' size={18} />,
      path: "/app",
  },
  {
      name: "Settings",
      icon: <LuSettings2 color='#6400a7' size={18} />,
      path: "/app/settings",
  },
]

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

export const getTimeFromDate = (dateInput: Date | string) => {

  const date = new Date(dateInput);
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export const scrollElementToBottom = (obj: RefObject<HTMLElement | null>) => {
  if (!obj.current) return;
  const element = obj.current;
  element.scrollTop = element.scrollHeight;
}

export const defaultNotificationCounts: Record<NotificationCountsIndex, number> = {
  chats: 0,
  calls: 0,
  //alerts: 0,
}


export const statusIcon: Record<Message['status'], ReactNode> = {
  sent: <IoCheckmark style={{ color: "#999999" }} />,
  delivered: <IoCheckmarkDone style={{ color: "#999999" }} />,
  read: <IoCheckmarkDone style={{ color: '#33ff00' }} />,
}


export const presenceColor = {
  online: '#4caf50',
  offline: '#999999',
  away: '#ff9800',
  busy: '#f44336',
}

export const getUserPresenceStatus = (presence: Presence["status"], last_seen: Date): string => {
  let status: string;

  if (presence !== "offline") {
    return presence;
  }

  // when user is offline → compute last seen
  const now = new Date();
  const diffMs = now.getTime() - new Date(last_seen).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) {
    status = "just now";
  } else if (diffMin < 60) {
    status = `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    status = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffDays === 1) {
    status = "yesterday";
  } else {
    const last = new Date(last_seen);
    const isThisYear = last.getFullYear() === now.getFullYear();

    const day = last.getDate();
    const month = last.toLocaleString("en-US", { month: "short" });

    status = isThisYear
      ? `${day}, ${month}`
      : `${day}, ${month} ${last.getFullYear()}`;
  }

  return status;
};



export const createMediaPreviewObject = (file: File): PreviewMediaData => {
  const fileType = getFileType(file.type);
  const fileExtension = getFileExtension(file.name);
  const fileSize = formatFileSize(file.size);
  const previewUrl =
    fileType === "photo" || fileType === "video"
      ? URL.createObjectURL(file)
      : "";

  return {
    previewUrl,
    fileType,
    fileName: file.name,
    fileExtension,
    fileSize,
  };
};

export const getFileType = (mime: string): PreviewMediaData["fileType"] => {
  if (mime.startsWith("image/")) return "photo";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "others";
};

export const getFileExtension = (name: string): string => {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
};

export const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};


export function groupMessagesByDate(messages: Message[]): GroupedMessages[] {
  const now = new Date();

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getDateLabel = (date: Date): string => {
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (isSameDay(date, now)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}, ${month} ${year}`;
  };

  // Sort all messages by timestamp first (ascending)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const grouped = sortedMessages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp);
    const label = getDateLabel(date);

    if (!acc[label]) acc[label] = { dateLabel: label, messages: [] };
    acc[label].messages.push(msg);

    return acc;
  }, {} as Record<string, GroupedMessages>);

  // Sort the groups by date (ascending)
  const sortedGroups = Object.values(grouped).sort((a, b) => {
    const getDateValue = (label: string) => {
      if (label === "Today") return now.getTime();
      if (label === "Yesterday") {
        const y = new Date();
        y.setDate(now.getDate() - 1);
        return y.getTime();
      }
      return new Date(label).getTime();
    };
    return getDateValue(a.dateLabel) - getDateValue(b.dateLabel);
  });

  return sortedGroups;
}
