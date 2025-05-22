// lib/socket/emit.ts
import type { ClientToServerEvents } from "@shared/types";
import { socketRef } from "./socketInstance";

export function emit<EventName extends keyof ClientToServerEvents>(
	event: EventName,
	...args: Parameters<ClientToServerEvents[EventName]>
): void {
	const socket = socketRef.current;

	if (socket?.connected) {
		socket.emit(event, ...args);
	} else {
		console.warn(`Socket is not connected. Cannot emit "${event}"`);
	}
}
