import type { ServerToClientEvents } from "@shared/types";
import type { Socket } from "socket.io";

export function serverEmit(socket: Socket<ServerToClientEvents>) {
	return function emit<Event extends keyof ServerToClientEvents>(
		event: Event,
		...args: Parameters<ServerToClientEvents[Event]>
	): void {
		socket.emit(event, ...args);
	};
}
