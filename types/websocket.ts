export interface WebSocketEvent<T = unknown> {
    event: string;
    data: T;
}