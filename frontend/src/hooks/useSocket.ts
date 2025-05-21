import {
	Events,
	type ClientToServerEvents,
	type ServerToClientEvents,
} from "@shared/types"; // Adjust the import path
import { useCallback, useEffect, useRef, useState } from "react";
import { type Socket, io } from "socket.io-client";

type SocketState = "disconnected" | "connecting" | "connected" | "reconnecting";

interface UseSocketOptions {
	autoConnect?: boolean;
	reconnectionAttempts?: number;
	reconnectionDelay?: number;
	reconnectionDelayMax?: number;
	timeout?: number;
}

const SOCKET_URL = "http://localhost:3000";

export function useSocket(options: UseSocketOptions = {}) {
	const {
		autoConnect = true,
		reconnectionAttempts = 5,
		reconnectionDelay = 1000,
		reconnectionDelayMax = 5000,
		timeout = 20000,
	} = options;

	// Store socket instance in a ref to persist across renders
	const socketRef = useRef<Socket<
		ServerToClientEvents,
		ClientToServerEvents
	> | null>(null);

	// Connection state tracking
	const [isConnected, setIsConnected] = useState(false);
	const [socketState, setSocketState] = useState<SocketState>("disconnected");
	const [lastError, setLastError] = useState<Error | null>(null);
	const [reconnectAttempt, setReconnectAttempt] = useState(0);

	// Queue for messages sent while disconnected
	type PendingMessage<
		E extends keyof ClientToServerEvents = keyof ClientToServerEvents,
	> = {
		event: E;
		args: Parameters<ClientToServerEvents[E]>;
	};

	const pendingMessagesRef = useRef<PendingMessage[]>([]);

	/**
	 * Initialize socket connection with configuration
	 */
	const connect = useCallback(() => {
		if (!socketRef.current || !socketRef.current.connected) {
			setSocketState("connecting");
			setLastError(null);

			// Initialize socket with options
			socketRef.current = io(SOCKET_URL, {
				reconnectionAttempts,
				reconnectionDelay,
				reconnectionDelayMax,
				timeout,
				autoConnect: true,
			});

			// Connection event handlers
			socketRef.current.on("connect", () => {
				setIsConnected(true);
				setSocketState("connected");
				setReconnectAttempt(0);
				console.log("Socket.IO connected");

				// Process any pending messages that were queued while disconnected
				if (pendingMessagesRef.current.length > 0) {
					console.log(
						`Processing ${pendingMessagesRef.current.length} pending messages`,
					);
					for (const { event, args } of pendingMessagesRef.current) {
						socketRef.current?.emit(event, ...args);
					}
					pendingMessagesRef.current = [];
				}
			});

			socketRef.current.on("disconnect", (reason) => {
				setIsConnected(false);
				setSocketState("disconnected");
				console.log("Socket.IO disconnected:", reason);

				// If the disconnect was intended by the server, don't attempt to reconnect
				if (reason === "io server disconnect") {
					console.log("Server forced disconnect - not attempting to reconnect");
				} else {
					handleReconnect();
				}
			});

			socketRef.current.on("connect_error", (err) => {
				console.error("Socket.IO connection error:", err);
				setLastError(err);
				setSocketState("disconnected");
				handleReconnect();
			});

			// Add global handlers for session_closed event
			socketRef.current.on(Events.SESSION_CLOSED, () => {
				console.log("Global session closed event received");
				// This is now handled in both session and game hooks
			});
		}
	}, [reconnectionAttempts, reconnectionDelay, reconnectionDelayMax, timeout]);

	/**
	 * Handles reconnection logic
	 */
	const handleReconnect = useCallback(() => {
		if (reconnectAttempt < reconnectionAttempts) {
			setSocketState("reconnecting");
			setReconnectAttempt((prev) => prev + 1);

			const delay = Math.min(
				reconnectionDelay * 1.5 ** reconnectAttempt,
				reconnectionDelayMax,
			);

			console.log(
				`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempt + 1}/${reconnectionAttempts})`,
			);

			setTimeout(() => {
				if (socketRef.current) {
					socketRef.current.connect();
				} else {
					connect();
				}
			}, delay);
		} else {
			console.error(
				`Failed to reconnect after ${reconnectionAttempts} attempts`,
			);
			setSocketState("disconnected");
		}
	}, [
		reconnectAttempt,
		reconnectionAttempts,
		reconnectionDelay,
		reconnectionDelayMax,
		connect,
	]);

	/**
	 * Manually disconnect the socket
	 */
	const disconnect = useCallback(() => {
		if (socketRef.current?.connected) {
			// Make sure to leave any active session before disconnecting
			emit(Events.LEAVE_SESSION);

			socketRef.current.disconnect();
			setSocketState("disconnected");
		}
	}, []);

	/**
	 * Auto-connect on mount, disconnect on unmount
	 */
	useEffect(() => {
		if (autoConnect) {
			connect();
		}

		return () => {
			disconnect();
		};
	}, [connect, disconnect, autoConnect]);

	/**
	 * Emit an event to the server with type safety
	 */
	const emit = useCallback(
		<EventName extends keyof ClientToServerEvents>(
			event: EventName,
			...args: Parameters<ClientToServerEvents[EventName]>
		): void => {
			if (socketRef.current?.connected) {
				socketRef.current.emit(event, ...args);
			} else {
				console.warn(
					`Attempted to emit event "${String(event)}" while socket is not connected. Queueing message.`,
				);
				// Queue message to be sent when connection is established
				pendingMessagesRef.current.push({ event, args });

				// If disconnected, attempt to reconnect
				if (socketState === "disconnected") {
					connect();
				}
			}
		},
		[connect, socketState],
	);

	/**
	 * Register an event listener
	 */
	const on = useCallback(
		<EventName extends keyof ServerToClientEvents>(
			event: EventName,
			listener: ServerToClientEvents[EventName],
		) => {
			if (socketRef.current) {
				// biome-ignore lint/suspicious/noExplicitAny: unable to infer here
				socketRef.current.on(event, listener as any);
			}
		},
		[],
	);

	/**
	 * Remove an event listener
	 */
	const off = useCallback(
		<EventName extends keyof ServerToClientEvents>(
			event: EventName,
			listener: ServerToClientEvents[EventName],
		) => {
			if (socketRef.current) {
				// biome-ignore lint/suspicious/noExplicitAny: unable to infer here
				socketRef.current.off(event, listener as any);
			}
		},
		[],
	);

	// Return the socket interface
	return {
		socket: socketRef.current,
		isConnected,
		socketState,
		lastError,
		reconnectAttempt,
		connect,
		disconnect,
		emit,
		on,
		off,
	};
}
