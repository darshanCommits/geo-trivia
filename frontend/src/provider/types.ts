import type { Socket } from "socket.io-client";
import type {
	ClientToServerEvents,
	ServerToClientEvents,
	Types,
} from "@shared/types";
import type { SessionStore } from "@/stores/useSession.store";
import type { GameStore } from "@/stores/useGame.store";
import type { SocketStore } from "@/stores/useSocket.store";

export interface SocketContextValue {
	socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
	emit: FnTypes.CreateEmitFunction;
}

export interface SocketProviderOptions {
	socketUrl: string;
	autoConnect?: boolean;
	reconnectionAttempts?: number;
	reconnectionDelay?: number;
	reconnectionDelayMax?: number;
	timeout?: number;
}

export namespace FnTypes {
	export type CreateEmitFunction = (
		socketRef: React.RefObject<Socket<
			ServerToClientEvents,
			ClientToServerEvents
		> | null>,
	) => <EventName extends keyof ClientToServerEvents>(
		event: EventName,
		...args: Parameters<ClientToServerEvents[EventName]>
	) => void;

	export type CreateAnswerResultHandler = (
		gameStore: Pick<GameStore, "setAnswerResult" | "setState">,
		sessionStore: Pick<SessionStore, "setUsers" | "syncScoresToGameStore" | "users" | "setState">,
	) => (
		payload: Readonly<{
			username: string;
			isAnswerCorrect: boolean;
			answer: number;
			scores: Types.Score[];
		}>,
	) => void;

	export type CreateConnectErrorHandler = (
		socketStore: Pick<SocketStore, "setState">,
	) => (err: Error) => void;

	export type CreateConnectionHandler = (
		socketStore: Pick<SocketStore, "setState">,
	) => () => void;

	export type CreateDisconnectHandler = (
		socketStore: Pick<SocketStore, "setState">,
	) => (reason: string) => void;

	export type CreateGameOverHandler = (
		gameStore: Pick<GameStore, "setGameOver" | "setState">,
		sessionStore: Pick<SessionStore, "setUsers" | "syncScoresToGameStore" | "users" | "setState">,
	) => (
		payload: Readonly<{
			finalScores: Types.Score[];
		}>,
	) => void;

	export type CreateQuestionPromptHandler = (
		gameStore: Pick<GameStore, "setCurrentQuestion" | "setGameStarted" | "resetGame" | "setState">,
		sessionStore: Pick<SessionStore, "setState">,
	) => (
		payload: Readonly<{
			question: Types.QuestionType;
			index: number;
			total: number;
		}>,
	) => void;

	export type CreateSessionClosedHandler = (
		gameStore: Pick<GameStore, "resetGame" | "setError" | "setState">,
		sessionStore: Pick<SessionStore, "resetSession" | "setStatus" | "setState">,
		socketStore: Pick<SocketStore, "setState">,
	) => () => void;

	export type CreateSessionCreatedHandler = (
		socketRef: React.RefObject<Socket<
			ServerToClientEvents,
			ClientToServerEvents
		> | null>,
		sessionStore: Pick<SessionStore, "addUser" | "setState">,
	) => (
		payload: Readonly<{
			sessionId: string;
			username: string;
		}>,
	) => void;

	export type CreateSessionExistsHandler = (
		sessionStore: Pick<SessionStore, "resetSession" | "setState">,
		gameStore: Pick<GameStore, "resetGame" | "setState">,
	) => () => void;

	export type CreateUserJoinedHandler = (
		socketRef: React.RefObject<Socket<
			ServerToClientEvents,
			ClientToServerEvents
		> | null>,
		sessionStore: Pick<SessionStore, "addUser" | "syncScoresToGameStore" | "users" | "setState">,
	) => (
		payload: Readonly<{
			username: string;
			id: string;
		}>,
	) => void;

	export type CreateUserLeftHandler = (
		sessionStore: Pick<SessionStore, "removeUser" | "syncScoresToGameStore" | "users" | "setState">,
	) => (payload: Readonly<{ userId: string }>) => void;

	export type CreateUsernameTakenHandler = (
		sessionStore: Pick<SessionStore, "resetSession" | "setState">,
		gameStore: Pick<GameStore, "resetGame" | "setState">,
	) => () => void;

	export type CleanupSocket = (
		socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
		socketStore: Pick<SocketStore, "setState">,
	) => void;
}
