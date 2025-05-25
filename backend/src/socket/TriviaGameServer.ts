import { Server as SocketIOServer, type Socket } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import type {
	ClientEventName,
	ServerEventName,
	ClientToServerEvents,
	ServerToClientEvents,
	ClientEvents,
	ServerEvents,
	LogEntry,
	WSError,
	ClientResponse,
	User,
	GameSession,
	SocketData,
} from "@shared/types";
type SessionId = string;

export class TriviaGameServer {
	private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
	private onConnectionCallbacks: Array<
		(socket: Socket<ClientToServerEvents, ServerToClientEvents>) => void
	> = [];
	public sessions = new Map<SessionId, GameSession>(); // sessionId -> users. using the type User["sessionId"] instead of string for explicitness.

	constructor(server: HTTPServer) {
		this.io = new SocketIOServer<
			ClientToServerEvents,
			ServerToClientEvents,
			any,
			SocketData
		>(server, { cors: { origin: "*" } });
		this.setupConnection();
	}

	/**
	 * Register a callback to run on each new connection.
	 */
	public onConnection(
		fn: (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => void,
	) {
		this.onConnectionCallbacks.push(fn);
	}

	/**
	 * Convenience for registering client event handlers.
	 */
	public handle<K extends ClientEventName>(
		event: K,
		handler: (
			data: ClientEvents[K]["request"],
			socket: Socket,
		) => Promise<ClientEvents[K]["response"]>,
	) {
		this.onConnection((socket) => {
			socket.on(
				event,
				async (
					payload: ClientEvents[K]["request"],
					cb: (resp: ClientResponse<K>) => void,
				) => {
					try {
						const response = await handler(payload, socket);
						cb(response);
					} catch (error) {
						console.error(`Error handling ${event} on ${socket.id}:`, error);

						let err: WSError;

						if (
							typeof error === "object" &&
							error !== null &&
							"error" in error
						) {
							err = error as WSError;
						} else if (error instanceof Error) {
							// Use the error message from the thrown Error
							err = {
								error: error.message,
							};
						} else {
							// Fallback generic error message
							err = {
								error: "Internal server error",
							};
						}

						cb(err);
					}
				},
			);
		});
	}

	private setupConnection() {
		this.io.use((socket, next) => {
			// Per-event middleware
			socket.use(async (packet, nextPacket) => {
				const [event, payload] = packet;
				this.logInternal({
					direction: "send",
					event: event as ServerEventName,
					data: payload,
					messageId: socket.id,
				});
				try {
					nextPacket();
				} catch (err) {
					console.error(`Error in handler ${event} from ${socket.id}:`, err);
					const last = packet[packet.length - 1];
					if (typeof last === "function") {
						last({ error: "Internal server error", code: "INTERNAL_ERROR" });
					}
				}
			});
			next();
		});

		this.io.on("connection", (socket) => {
			console.log("User connected:", socket.id);
			this.onConnectionCallbacks.forEach((cb) => cb(socket));
			socket.on("disconnect", () => {
				const { sessionId, username } = socket.data;
				if (sessionId && username) {
					this.broadcastToSession(sessionId, "session:user-left", {
						username,
						sessionId: sessionId,
					});
				}
				console.log("User disconnected:", socket.id);
			});
		});
	}

	/// Sends to a single connection(@socket)
	public emit<T extends ServerEventName>(
		socket: Socket<ClientToServerEvents, ServerToClientEvents>,
		type: T,
		data: ServerEvents[T],
	): void {
		(socket.emit as any)(type, data);
		this.logInternal({
			direction: "send",
			event: type,
			data,
			messageId: socket.id,
		});
	}

	/// Sends to all connection that are part of @sessionId
	public broadcastToSession<T extends ServerEventName>(
		sessionId: string,
		type: T,
		data: ServerEvents[T],
	): void {
		(this.io.to(sessionId) as any).emit(type, data);
		this.logInternal({
			direction: "send",
			event: type,
			data,
			messageId: `session:${sessionId}`,
		});
	}

	/// Sends to all connection
	public broadcast<T extends ServerEventName>(
		type: T,
		data: ServerEvents[T],
	): void {
		(this.io.emit as any)(type, data);
		this.logInternal({
			direction: "send",
			event: type,
			data,
			messageId: "broadcast",
		});
	}

	public setSocketData(
		socket: Socket<ClientToServerEvents, ServerToClientEvents>,
		data: Partial<SocketData>,
	): void {
		Object.assign(socket.data, data);
	}

	private logInternal(entry: LogEntry): void {
		const timestamp = new Date().toISOString();
		console.log(
			`[${timestamp}] ${entry.direction.toUpperCase()} ${entry.event}:`,
			JSON.stringify(entry.data, null, 2),
		);

		console.table(
			Array.from(this.sessions.entries()).map(([sessionId, session]) => ({
				sessionId,
				host: session.hostUsername,
				status: session.status,
				players: session.players.map((p) => p.username),
				currentQuestion: session.currentQuestion ?? "-",
				maxPlayers: session.maxPlayers ?? "-",
			})),
		);
	}

	logSocketData(from: string, data: Partial<SocketData>) {
		console.log(`\n[Socket Data from ${from}]`);

		if (data.user) {
			const { username, sessionId, score, id } = data.user;
			console.log(
				`User: ${username} (id: ${id ?? "<none>"}), Session: ${sessionId}, Score: ${score ?? 0}`,
			);
		} else {
			console.log("User: <none>");
		}

		if (data.session) {
			const { id, hostUsername, players, status, currentQuestion, maxPlayers } =
				data.session;

			console.log(`Session ID: ${id}`);
			console.log(`Host: ${hostUsername}`);
			console.log(`Status: ${status}`);
			console.log(`Players: ${players.map((x) => x.username)}`);
			if (currentQuestion !== undefined) {
				console.log(`Current Question: ${currentQuestion}`);
			}
			if (maxPlayers !== undefined) {
				console.log(`Max Players: ${maxPlayers}`);
			}
		} else {
			console.log("Session: <none>");
		}

		console.log(""); // extra line for spacing
	}
	public log(msg: string): void {
		const timestamp = new Date().toISOString();
		console.log(`[${timestamp}]${msg}:`);
	}
}
