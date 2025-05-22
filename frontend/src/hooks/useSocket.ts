import { SocketContext } from "@/provider/socket.provider";
import { type ClientToServerEvents, Events } from "@shared/types";
import { useCallback, useContext, useEffect, useState } from "react";

export const useSocket = () => {
	const context = useContext(SocketContext);

	if (!context) {
		throw new Error("useSocket must be used within a SocketProvider");
	}

	const { socket } = context;
	const [isConnected, setIsConnected] = useState(false);

	const emit = useCallback(
		<EventName extends keyof ClientToServerEvents>(
			event: EventName,
			...args: Parameters<ClientToServerEvents[EventName]>
		) => {
			if (socket?.connected) {
				socket.emit(event, ...args);
			} else {
				console.warn("Socket is not connected. Cannot emit event:", event);
			}
		},
		[socket],
	);

	useEffect(() => {
		if (!socket) return;

		const handleConnect = () => setIsConnected(true);
		const handleDisconnect = () => setIsConnected(false);

		// Set initial connection state
		setIsConnected(socket.connected);

		socket.on("connect", handleConnect);
		socket.on(Events.DISCONNECT, handleDisconnect);

		return () => {
			socket.off("connect", handleConnect);
			socket.off(Events.DISCONNECT, handleDisconnect);
		};
	}, [socket]);

	return { socket, isConnected, emit };
};
