export interface colorScheme {
    background: string;
    text: string;
}

export interface Response {
    message?: string | undefined;
    status?: number | undefined;
    data?: any | undefined;
}