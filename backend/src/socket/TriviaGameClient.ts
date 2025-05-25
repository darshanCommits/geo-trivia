import { io, Socket } from "socket.io-client";
class TriviaGameClient {
	private ws: WebSocket;
	private handlers: Partial<ServerEventHandlers> = {};
	private pendingResponses = new Map<string, (response: any) => void>();
	private currentUser?: User; // Store current user info

	constructor(url: string) {
		this.ws = new WebSocket(url);
		this.ws.onmessage = this.handleMessage.bind(this);
	}

	// Send request and wait for response
	async request<T extends keyof APIEndpoints>(
		type: T extends keyof ClientEventHandlers ? T : never,
		data: APIEndpoints[T]["request"],
	): Promise<APIEndpoints[T]["response"]> {
		const id = crypto.randomUUID();

		return new Promise((resolve) => {
			this.pendingResponses.set(id, resolve);

			const message: RequestMessage<T> = {
				id,
				type,
				data,
				timestamp: Date.now(),
			};

			this.ws.send(JSON.stringify(message));
		});
	}

	// Register event handlers for server-initiated events
	on<T extends keyof APIEndpoints>(
		type: T,
		handler: (data: APIEndpoints[T]["response"]) => void,
	) {
		this.handlers[type] = handler;
	}

	// Convenience methods for common operations
	async createSession(username: string) {
		const result = await this.request("session:create", { username });
		if ("user" in result) {
			this.currentUser = result.user;
		}
		return result;
	}

	async joinSession(username: string, sessionId: string) {
		const result = await this.request("session:join", { username, sessionId });
		if ("user" in result) {
			this.currentUser = result.user;
		}
		return result;
	}

	async leaveSession() {
		if (!this.currentUser?.id) {
			throw new Error("No user logged in");
		}
		return this.request("session:leave", { userId: this.currentUser.id });
	}

	async startGame() {
		if (!this.currentUser?.id) {
			throw new Error("No user logged in");
		}
		return this.request("game:start", { userId: this.currentUser.id });
	}

	async submitAnswer(answer: Answer) {
		if (!this.currentUser?.id) {
			throw new Error("No user logged in");
		}
		return this.request("game:answer", { userId: this.currentUser.id, answer });
	}

	private handleMessage(event: MessageEvent) {
		const message = JSON.parse(event.data) as ServerMessage;

		// Handle response to a request
		const pendingHandler = this.pendingResponses.get(message.id);
		if (pendingHandler) {
			pendingHandler(message.data);
			this.pendingResponses.delete(message.id);
			return;
		}

		// Handle server-initiated event
		const handler = this.handlers[message.type];
		if (handler) {
			handler(message.data);
		}
	}
}
