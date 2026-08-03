import { apiFetch } from "./api";

interface WebSocketTokenResponse {
    status: string;
    data: {
        token: string;
    };
}

export async function getWebSocketToken() {
    const response =
        await apiFetch<WebSocketTokenResponse>(
            "/api/websocket/token",
            {
                method: "POST",
            }
        );

    return response.data.token;
}