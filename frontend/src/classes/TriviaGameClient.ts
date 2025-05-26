import { io as clientIo, type Socket as ClientSocket } from "socket.io-client";
import type { User } from "@shared/core.types";
import type {
	ClientEvents,
	ClientResponseWithError,
	ServerEvents,
	WSError,
} from "@shared/events.types";
import type { LogEntry } from "@shared/log.types";
import type {
	ClientEventName,
	ServerEventName,
	ClientResponse,
	ServerToClientEvents,
	ClientToServerEvents,
	ClientEventHandler,
} from "@shared/types";

export class TriviaGameClient {
	private _socket: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
	private currentUser?: User;
	private messageCounter = 0;

	constructor(url: string) {
		this._socket = clientIo(url);
		this.setupEventHandlers();
	}

	private setupEventHandlers(): void {
		this._socket.on("connect", () => {
			console.log("Connected to server:", this._socket.id);
		});

		this._socket.on("disconnect", () => {
			console.log("Disconnected from server");
		});

		this._socket.on("error", (error: WSError) => {
			console.error("Socket error:", error);
		});
	}

	private generateMessageId(): string {
		return `${this._socket.id || "unknown"}-${++this.messageCounter}`;
	}

	private logRequest(entry: LogEntry): void {
		const timestamp = new Date().toISOString();
		console.log(
			`[${timestamp}] ${entry.direction.toUpperCase()} ${entry.event}:`,
			JSON.stringify(entry.data, null, 2),
		);
	}

	// Send request and wait for response
	async request<T extends ClientEventName>(
		type: T,
		payload: ClientEvents[T]["request"],
	): Promise<ClientResponseWithError<T>> {
		const messageId = this.generateMessageId();

		this.logRequest({
			direction: "send",
			event: type,
			data: payload,
			messageId,
		});

		return new Promise((resolve) => {
			this._socket
				.timeout(5000)
				.emit(type, payload, (err: Error | null, response: any) => {
					this.logRequest({
						direction: "response",
						event: type,
						data: response,
						messageId,
					});

					// Handle timeout or server error callback
					if (err) {
						return resolve({
							success: false,
							error: {
								message: err.message || "Server did not respond",
								reason: "timeout_or_network_error",
							},
						});
					}

					// Validate response shape
					if (typeof response === "object" && response !== null) {
						if (response.success === true) {
							return resolve({ success: true, data: response.data });
						}

						if (response.success === false) {
							return resolve({
								success: false,
								error: response.error ?? {
									message: "Unknown error",
									reason: "unknown_error",
								},
							});
						}
					}

					// Fallback for invalid or unexpected response
					return resolve({
						success: false,
						error: {
							message: "Malformed or invalid response",
							reason: "malformed_response",
						},
					});
				});
		});
	}

	// Register event handlers for server-initiated events with logging
	on<T extends ServerEventName>(
		event: T,
		handler: (data: ServerEvents[T]) => void,
	): void {
		const wrappedHandler = (data: ServerEvents[T]) => {
			this.logRequest({
				direction: "receive",
				event: event,
				data,
				messageId: this.generateMessageId(),
			});
			handler(data);
		};
		this._socket.on(event, wrappedHandler);
	}

	// Remove event handler for server events
	off<T extends ServerEventName>(
		type: T,
		handler?: (data: ServerEvents[T]) => void,
	): void {
		if (handler) {
			this._socket.off(type, handler);
		} else {
			this._socket.off(type);
		}
	}

	// Expose socket for direct access if needed
	get socket(): ClientSocket<ServerToClientEvents, ClientToServerEvents> {
		return this._socket;
	}

	// Connection management
	connect(): void {
		if (!this._socket.connected) {
			this._socket.connect();
		}
	}

	disconnect(): void {
		this._socket.disconnect();
		this.currentUser = undefined;
	}

	// Getters
	get user(): User | undefined {
		return this.currentUser;
	}

	get connected(): boolean {
		return this._socket.connected;
	}

	get socketId(): string | undefined {
		return this._socket.id;
	}

	// Helper method to set current user (you might want to call this after successful login)
	setCurrentUser(user: User): void {
		this.currentUser = user;
	}
}
