import { io as clientIo, type Socket as ClientSocket } from "socket.io-client";
import type {
	User,
	Answer,
	ClientEvents,
	ServerEvents,
	ClientEventName,
	ServerEventName,
	ClientResponse,
	WSError,
	LogEntry,
	ServerToClientEvents,
	ClientToServerEvents,
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
	): Promise<ClientResponse<T>> {
		const messageId = this.generateMessageId();

		this.logRequest({
			direction: "send",
			event: type,
			data: payload,
			messageId,
		});

		return new Promise((resolve) => {
			(this._socket as any).emit(
				type,
				payload,
				(response: ClientResponse<T>) => {
					this.logRequest({
						direction: "response",
						event: type,
						data: response,
						messageId,
					});
					resolve(response);
				},
			);
		});
	}

	// Register event handlers for server-initiated events with logging
	on<T extends ServerEventName>(
		type: T,
		handler: (data: ServerEvents[T]) => void,
	): void {
		const wrappedHandler = (data: ServerEvents[T]) => {
			this.logRequest({
				direction: "receive",
				event: type,
				data,
				messageId: this.generateMessageId(),
			});
			handler(data);
		};

		this._socket.on(type as any, wrappedHandler);
	}

	// Remove event handler
	off<T extends ServerEventName>(
		type: T,
		handler?: (data: ServerEvents[T]) => void,
	): void {
		if (handler) {
			this._socket.off(type, handler as any);
		} else {
			this._socket.off(type as any);
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

	// Convenience methods for common operations
	async createSession(
		username: string,
	): Promise<ClientResponse<"session:create">> {
		const result = await this.request("session:create", { username });

		if (!this.isError(result)) {
			this.currentUser = result.user;
			// Room joining is handled automatically on the server side
		}

		return result;
	}

	// Fixed joinSession method - takes username and sessionId
	async joinSession(
		username: string,
		sessionId: string,
	): Promise<ClientResponse<"session:join">> {
		const result = await this.request("session:join", { username, sessionId });

		if (!this.isError(result)) {
			this.currentUser = result.user;
			// Room joining is handled automatically on the server side
		}

		return result;
	}

	async leaveSession(): Promise<ClientResponse<"session:leave">> {
		if (!this.currentUser) {
			throw new Error("No user logged in");
		}

		const result = await this.request("session:leave", this.currentUser);

		if (!this.isError(result)) {
			// Room leaving is handled automatically on the server side
			this.currentUser = undefined;
		}

		return result;
	}

	async startGame(): Promise<ClientResponse<"game:start">> {
		if (!this.currentUser?.username) {
			throw new Error("No user logged in");
		}

		return this.request("game:start", {
			username: this.currentUser.username,
		});
	}

	async submitAnswer(answer: Answer): Promise<ClientResponse<"game:answer">> {
		if (!this.currentUser?.username) {
			throw new Error("No user logged in");
		}

		return this.request("game:answer", {
			username: this.currentUser.username,
			answer,
		});
	}

	async skipQuestion(): Promise<ClientResponse<"game:skip">> {
		if (!this.currentUser?.username) {
			throw new Error("No user logged in");
		}

		return this.request("game:skip", {
			username: this.currentUser.username,
		});
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

	// Type guard for error checking
	private isError(response: unknown): response is WSError {
		return (
			typeof response === "object" && response !== null && "error" in response
		);
	}
}
