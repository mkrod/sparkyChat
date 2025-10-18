import type { CSSProperties } from "react";

export interface colorScheme {
    background: CSSProperties['background'];
    fadeBackground: CSSProperties['background'];
    text: CSSProperties['color'];
    fadedBorder: CSSProperties['borderColor'];
    textFade: CSSProperties['color'];
}

export type Scheme = "dark" | "light";

export interface Response {
    message?: string | undefined;
    status?: number | undefined;
    data?: any | undefined;
}

export interface User {
    user_id: string;
    username: string;
    email: string;
    name: {
        first: string;
        last: string;
    };
    picture: string;
    created_at: string;
}