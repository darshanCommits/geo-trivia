import type {
	ClientEvents,
	ServerEvents,
	WSError,
	WSMessage,
} from "./events.types";

export type ClientEventName = keyof ClientEvents;
export type ServerEventName = keyof ServerEvents;
export type EventName = ClientEventName | ServerEventName;

// Message types
export type ClientRequest<T extends ClientEventName> = WSMessage<
	T,
	ClientEvents[T]["request"]
>;
export type ClientResponse<T extends ClientEventName> =
	| ClientEvents[T]["response"]
	| WSError;
export type ServerBroadcast<T extends ServerEventName> = WSMessage<
	T,
	ServerEvents[T]
>;

// Handler types
export type ClientEventHandler<T extends ClientEventName> = (
	data: ClientEvents[T]["request"],
	messageId: string,
) => Promise<ClientResponse<T>> | ClientResponse<T>;

export type ServerEventHandler<T extends ServerEventName> = (
	data: ServerEvents[T],
) => void;

// Socket.IO compatible interfaces
export type ClientToServerEvents = {
	[K in ClientEventName]: (
		payload: ClientEvents[K]["request"],
		callback: (response: ClientResponse<K>) => void,
	) => void;
};

export type ServerToClientEvents = {
	[K in ServerEventName]: (payload: ServerEvents[K]) => void;
};

// Event handler maps
export type ClientEventHandlers = {
	[K in ClientEventName]: ClientEventHandler<K>;
};

export type ServerEventHandlers = {
	[K in ServerEventName]: ServerEventHandler<K>;
};
