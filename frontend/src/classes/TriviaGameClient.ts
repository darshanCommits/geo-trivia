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
	private socket: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
	private currentUser?: User;
	private messageCounter = 0;

	constructor(url: string) {
		this.socket = clientIo(url);
		this.setupEventHandlers();
	}

	private setupEventHandlers(): void {
		this.socket.on("connect", () => {
			console.log("Connected to server:", this.socket.id);
		});

		this.socket.on("disconnect", () => {
			console.log("Disconnected from server");
		});

		this.socket.on("error", (error: WSError) => {
			console.error("Socket error:", error);
		});
	}

	private generateMessageId(): string {
		return `${this.socket.id || "unknown"}-${++this.messageCounter}`;
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
			(this.socket as any).emit(
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

	// Register event handlers for server-initiated events
	on<T extends ServerEventName>(
		type: T,
		handler: (data: ServerEvents[T]) => void,
	): void {
		this.socket.on(type as any, (data: ServerEvents[T]) => {
			this.logRequest({
				direction: "receive",
				event: type,
				data,
				messageId: this.generateMessageId(),
			});
			handler(data);
		});
	}

	// Remove event handler
	off<T extends ServerEventName>(
		type: T,
		handler?: (data: ServerEvents[T]) => void,
	): void {
		if (handler) {
			this.socket.off(type, handler as any);
		} else {
			this.socket.off(type as any);
		}
	}

	// Connection management
	connect(): void {
		if (!this.socket.connected) {
			this.socket.connect();
		}
	}

	disconnect(): void {
		this.socket.disconnect();
		this.currentUser = undefined;
	}

	// Convenience methods for common operations
	async createSession(
		username: string,
	): Promise<ClientResponse<"session:create">> {
		const result = await this.request("session:create", { username });

		if (!this.isError(result)) {
			this.currentUser = result.user;
		}

		return result;
	}

	async joinSession(
		sessionId: string,
		username: string,
	): Promise<ClientResponse<"session:join">> {
		const result = await this.request("session:join", { sessionId, username });

		if (!this.isError(result)) {
			this.currentUser = result.user;
		}

		return result;
	}

	async leaveSession(): Promise<ClientResponse<"session:leave">> {
		if (!this.currentUser?.id) {
			throw new Error("No user logged in");
		}

		const result = await this.request("session:leave", {
			userId: this.currentUser.id,
		});

		if (!this.isError(result) && result.success) {
			this.currentUser = undefined;
		}

		return result;
	}

	async startGame(): Promise<ClientResponse<"game:start">> {
		if (!this.currentUser?.id) {
			throw new Error("No user logged in");
		}

		return this.request("game:start", {
			userId: this.currentUser.id,
		});
	}

	async submitAnswer(answer: Answer): Promise<ClientResponse<"game:answer">> {
		if (!this.currentUser?.id) {
			throw new Error("No user logged in");
		}

		return this.request("game:answer", {
			userId: this.currentUser.id,
			answer,
		});
	}

	async skipQuestion(): Promise<ClientResponse<"game:skip">> {
		if (!this.currentUser?.id) {
			throw new Error("No user logged in");
		}

		return this.request("game:skip", {
			userId: this.currentUser.id,
		});
	}

	// Getters
	get user(): User | undefined {
		return this.currentUser;
	}

	get connected(): boolean {
		return this.socket.connected;
	}

	get socketId(): string | undefined {
		return this.socket.id;
	}

	// Type guard for error checking
	private isError(response: unknown): response is WSError {
		return (
			typeof response === "object" && response !== null && "error" in response
		);
	}
}
