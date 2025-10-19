interface CustomResponse {
    message?: string | undefined;
    status?: number | undefined;
    data?: any | undefined;
}

type SocketID = { socket_id: string };

export type { CustomResponse, SocketID }