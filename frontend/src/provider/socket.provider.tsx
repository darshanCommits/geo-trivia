// components/providers/SocketProvider.tsx
import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	type ReactNode,
} from "react";
import { io, type Socket, type SocketOptions } from "socket.io-client";
import {
	Events,
	type ServerToClientEvents,
	type ClientToServerEvents,
} from "@shared/types";

type SocketContextType = {
	socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
};

const SOCKET_URL = "http://localhost:3000";

export const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
	children: ReactNode;
	url?: string;
	options?: Partial<SocketOptions>;
}

export const SocketProvider = ({
	children,
	url = SOCKET_URL,
	options,
}: SocketProviderProps) => {
	const [socket, setSocket] = useState<Socket<
		ServerToClientEvents,
		ClientToServerEvents
	> | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	const emit = useCallback<
		(
			event: keyof ClientToServerEvents,
			...args: Parameters<ClientToServerEvents[keyof ClientToServerEvents]>
		) => void
	>(
		(event, ...args) => {
			if (socket && isConnected) {
				socket.emit(event, ...args);
			} else {
				console.warn("Socket is not connected. Cannot emit event:", event);
			}
		},
		[socket, isConnected],
	);

	useEffect(() => {
		// Create socket connection with options + autoConnect default true
		const socketInstance = io(url, {
			autoConnect: true,
			...(options ?? {}),
		});

		socketInstance.on("connect", () => {
			console.log(`Socket connected: ${socketInstance.id}`);
			setIsConnected(true);
		});

		socketInstance.on(Events.DISCONNECT, () => {
			console.log("Socket disconnected");
			setIsConnected(false);
		});

		// Handle connection errors
		socketInstance.on("connect_error", (error) => {
			console.error("Socket connection error:", error);
			setIsConnected(false);
		});

		setSocket(socketInstance);

		// Cleanup on unmount
		return () => {
			socketInstance.disconnect();
			setSocket(null);
			setIsConnected(false);
		};
	}, [url, options]);

	const contextValue: SocketContextType = {
		socket,
	};

	return (
		<SocketContext.Provider value={contextValue}>
			{children}
		</SocketContext.Provider>
	);
};
