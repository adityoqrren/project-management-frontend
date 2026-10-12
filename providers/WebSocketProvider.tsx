"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import { getWebSocketToken } from "@/lib/websocket";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

export interface WebSocketNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    entityType: string;
    entityId: string;
    projectId: string;
}

interface WebSocketContextValue {
    connected: boolean;
    subscribeToNotifications: (
        listener: (notification: WebSocketNotification) => void
    ) => () => void;
}

const WebSocketContext =
    createContext<WebSocketContextValue | null>(
        null
    );

export function useWebSocket() {
    const context =
        useContext(WebSocketContext);

    if (!context) {
        throw new Error(
            "useWebSocket must be used within WebSocketProvider"
        );
    }

    return context;
}

//typescript type guard
function isWebSocketNotification(
    data: unknown
): data is WebSocketNotification {
    if (
        typeof data !== "object" ||
        data === null
    ) {
        return false;
    }

    const notification =
        data as Record<string, unknown>;

    return (
        typeof notification.id === "string" &&
        typeof notification.type === "string" &&
        typeof notification.title === "string" &&
        typeof notification.message === "string" &&
        typeof notification.entityType === "string" &&
        typeof notification.entityId === "string" &&
        typeof notification.projectId === "string" &&
        typeof notification.createdAt === "string"
    );
}

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export function WebSocketProvider({
    children,
}: WebSocketProviderProps) {

    const [latestNotification, setLatestNotification] =
        useState<WebSocketNotification | null>(null);

    const queryClient = useQueryClient();

    const {
        user,
        loading,
    } = useAuth();

    const [connected, setConnected] =
        useState(false);

    const socketRef =
        useRef<WebSocket | null>(null);

    const connectingRef = useRef(false);

    const reconnectTimeoutRef =
        useRef<NodeJS.Timeout | null>(null);

    const shouldReconnectRef =
        useRef(true);

    const notificationListenersRef =
        useRef(
            new Set<
                (
                    notification: WebSocketNotification
                ) => void
            >()
        );

    const subscribeToNotifications =
        useCallback(
            (
                listener: (
                    notification: WebSocketNotification
                ) => void
            ) => {
                console.log(`subscribeToNotifications called`);
                notificationListenersRef.current.add(
                    listener
                );

                return () => {
                    notificationListenersRef.current.delete(
                        listener
                    );
                };
            },
            []
        );

    const notifyNotificationListeners = (
        notification: WebSocketNotification
    ) => {
        notificationListenersRef.current.forEach(
            (listener) => {
                listener(notification);
            }
        );
    };

    const handleNotificationCreated = (
        data: unknown
    ) => {
        queryClient.invalidateQueries({
            queryKey: [
                "notificationUnreadCount",
            ],
        });

        queryClient.invalidateQueries({
            queryKey: [
                "notifications",
            ],
        });

        if (
            !isWebSocketNotification(data)
        ) {
            return;
        }

        if (
            data.type === "task.updated" &&
            data.entityType === "task"
        ) {
            queryClient.invalidateQueries({
                queryKey: [
                    "projectTasks",
                    data.projectId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "myTasks",
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "dashboardTasks",
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "dashboardTaskCounts",
                ],
            });

            // refetchType: none prevent automatically refresh when cache is actively used (task detail opened)
            console.log("Invalidating task detail", {
                taskId: data.entityId,
            });

            queryClient.invalidateQueries({
                queryKey: ["task", data.entityId],
                refetchType: 'none',
            });
        }

        notifyNotificationListeners(data);
    };

    type WebSocketEventHandler = (
        data: unknown
    ) => void;

    const eventHandlers: Record<
        string,
        WebSocketEventHandler
    > = {

        "notification.created":
            handleNotificationCreated,

    };

    const handleMessage = (
        event: MessageEvent
    ) => {
        const message =
            JSON.parse(event.data);

        if (
            typeof message.event !== "string"
        ) {
            return;
        }

        const handler =
            eventHandlers[
            message.event
            ];

        if (!handler) {

            console.warn(
                `Unknown websocket event: ${message.event}`
            );

            return;

        }

        handler(message.data);
    };

    const connectWebSocket = async () => {
        console.log("CONNECT CALLED", {
            connecting: connectingRef.current,
            socket: socketRef.current?.readyState,
            shouldReconnect: shouldReconnectRef.current,
            time: new Date().toISOString(),
        });

        if (connectingRef.current) {
            console.log("CONNECT BLOCKED: already connecting");
            return;
        }

        if (
            socketRef.current &&
            (
                socketRef.current.readyState === WebSocket.OPEN ||
                socketRef.current.readyState === WebSocket.CONNECTING
            )
        ) {
            console.log("CONNECT BLOCKED: socket already exists");
            return;
        }

        connectingRef.current = true;

        console.log("CONNECT START");

        try {
            const token = await getWebSocketToken();

            if (!shouldReconnectRef.current) {
                connectingRef.current = false;
                return;
            }

            console.log(
                new Date().toLocaleTimeString(),
                "Creating websocket..."
            );

            const ws = new WebSocket(
                `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`
            );

            socketRef.current = ws;
            connectingRef.current = false;

            ws.onopen = () => {
                console.log("WebSocket connected");
                setConnected(true);
            };

            ws.onerror = (event) => {
                console.error("WebSocket error", event);
            };

            ws.onclose = () => {
                console.log(
                    new Date().toLocaleTimeString(),
                    "WebSocket disconnected"
                );

                setConnected(false);
                socketRef.current = null;

                if (!shouldReconnectRef.current) {
                    return;
                }

                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log("CONNECT FROM ONCLOSE");
                    connectWebSocket();
                }, 3000);
            };

            ws.onmessage = handleMessage;
        } catch (err) {
            connectingRef.current = false;

            console.error(
                "Failed to connect websocket",
                err
            );

            if (shouldReconnectRef.current) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log("CONNECT FROM CATCH");
                    connectWebSocket();
                }, 3000);
            }
        }
    };

    useEffect(() => {

        console.log("WebSocket effect", {
            loading,
            user,
        });

        if (loading) {
            return;
        }

        if (!user) {

            shouldReconnectRef.current =
                false;

            socketRef.current?.close();

            return;

        }

        shouldReconnectRef.current =
            true;

        console.log("CONNECT FROM EFFECT");
        connectWebSocket();

        return () => {

            shouldReconnectRef.current =
                false;

            console.log("Cleanup websocket");
            socketRef.current?.close();

            if (
                reconnectTimeoutRef.current
            ) {

                clearTimeout(
                    reconnectTimeoutRef.current
                );

            }

        };

    }, [
        loading,
        user,
    ]);

    return (

        <WebSocketContext.Provider
            value={{
                connected,
                subscribeToNotifications
            }}
        >

            {children}

        </WebSocketContext.Provider>

    );

}