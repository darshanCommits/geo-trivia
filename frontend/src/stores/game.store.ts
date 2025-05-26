import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
	User,
	GameSession,
	Question,
	GameResult,
	Leaderboard,
} from "@shared/types";

export interface GameState {
	// Connection
	connected: boolean;
	connecting: boolean;

	// User & Session
	user: User | null;
	session: GameSession | null;

	// Game State
	currentQuestion:
		| (Question & { questionNumber: number; totalQuestions: number })
		| null;
	leaderboard: Leaderboard;
	gameResults: GameResult | null;

	// UI State
	error: string | null;
	loading: boolean;

	// Game-specific UI state
	showCorrectAnswer: boolean;
	lastCorrectAnswer: number | null;
	explanation: string | null;
}

export interface GameActions {
	// Connection actions
	setConnected: (connected: boolean) => void;
	setConnecting: (connecting: boolean) => void;

	// User & Session actions
	setUser: (user: User | null) => void;
	setSession: (session: GameSession | null) => void;
	updateSessionPlayers: (players: User[]) => void;
	addPlayerToSession: (player: User) => void;
	removePlayerFromSession: (username: string) => void;

	// Game actions
	setCurrentQuestion: (
		question: Omit<GameState["currentQuestion"], "correctAnswer">,
	) => void;
	setLeaderboard: (leaderboard: Leaderboard) => void;
	setGameResults: (results: GameResult | null) => void;

	// Answer reveal actions
	showQuestionEnd: (
		correctAnswer: number,
		explanation?: string,
		leaderboard?: Leaderboard,
	) => void;
	hideAnswerReveal: () => void;

	// UI actions
	setError: (error: string | null) => void;
	setLoading: (loading: boolean) => void;
	clearError: () => void;

	// Composite actions
	resetGame: () => void;
	handleUserJoined: (user: User) => void;
	handleUserLeft: (user: User) => void;
	handleSessionDeleted: (sessionId: string, reason: string) => void;
}

type GameStore = GameState & GameActions;

const initialState: GameState = {
	connected: false,
	connecting: false,
	user: null,
	session: null,
	currentQuestion: null,
	leaderboard: [],
	gameResults: null,
	error: null,
	loading: false,
	showCorrectAnswer: false,
	lastCorrectAnswer: null,
	explanation: null,
};

export const useTriviaStore = create<GameStore>()(
	devtools(
		subscribeWithSelector(
			immer((set, get) => ({
				...initialState,

				// Connection actions
				setConnected: (connected) =>
					set((state) => {
						state.connected = connected;
						state.connecting = false;
					}),

				setConnecting: (connecting) =>
					set((state) => {
						state.connecting = connecting;
					}),

				// User & Session actions
				setUser: (user) =>
					set((state) => {
						state.user = user;
					}),

				setSession: (session) =>
					set((state) => {
						state.session = session;
					}),

				updateSessionPlayers: (players) =>
					set((state) => {
						if (state.session) {
							state.session.players = players;
						}
					}),

				addPlayerToSession: (player) =>
					set((state) => {
						if (state.session) {
							const exists = state.session.players.some(
								(p: User) => p.username === player.username,
							);
							if (!exists) {
								state.session.players.push(player);
							}
						}
					}),

				removePlayerFromSession: (username) =>
					set((state) => {
						if (state.session) {
							state.session.players = state.session.players.filter(
								(p: User) => p.username !== username,
							);
						}
					}),

				// Game actions
				setCurrentQuestion: (question) =>
					set((state) => {
						state.currentQuestion = question;
						state.showCorrectAnswer = false;
						state.lastCorrectAnswer = null;
						state.explanation = null;
					}),

				setLeaderboard: (leaderboard) =>
					set((state) => {
						state.leaderboard = leaderboard;
					}),

				setGameResults: (results) =>
					set((state) => {
						state.gameResults = results;
						state.currentQuestion = null;
						state.showCorrectAnswer = false;
					}),

				// Answer reveal actions
				showQuestionEnd: (correctAnswer, explanation, leaderboard) =>
					set((state) => {
						state.showCorrectAnswer = true;
						state.lastCorrectAnswer = correctAnswer;
						state.explanation = explanation || null;
						if (leaderboard) {
							state.leaderboard = leaderboard;
						}
					}),

				hideAnswerReveal: () =>
					set((state) => {
						state.showCorrectAnswer = false;
						state.lastCorrectAnswer = null;
						state.explanation = null;
					}),

				// UI actions
				setError: (error) =>
					set((state) => {
						state.error = error;
						state.loading = false;
					}),

				setLoading: (loading) =>
					set((state) => {
						state.loading = loading;
					}),

				clearError: () =>
					set((state) => {
						state.error = null;
					}),

				// Composite actions
				resetGame: () =>
					set((state) => {
						const { connected, user } = state;
						Object.assign(state, {
							...initialState,
							connected,
							user,
						});
					}),

				handleUserJoined: (user) => {
					const { addPlayerToSession } = get();
					addPlayerToSession(user);
				},

				handleUserLeft: (user) => {
					const { removePlayerFromSession } = get();
					removePlayerFromSession(user.username);
				},

				handleSessionDeleted: (sessionId, reason) =>
					set((state) => {
						if (state.session?.id === sessionId) {
							state.session = null;
							state.error = `Session deleted: ${reason}`;
						}
					}),
			})),
		),
		{ name: "trivia-game" },
	),
);

// Selectors for common derived state
export const useConnectionState = () =>
	useTriviaStore((state) => ({
		connected: state.connected,
		connecting: state.connecting,
	}));

export const useGameState = () =>
	useTriviaStore((state) => ({
		currentQuestion: state.currentQuestion,
		showCorrectAnswer: state.showCorrectAnswer,
		lastCorrectAnswer: state.lastCorrectAnswer,
		explanation: state.explanation,
		leaderboard: state.leaderboard,
		gameResults: state.gameResults,
	}));

export const useSessionState = () =>
	useTriviaStore((state) => ({
		user: state.user,
		session: state.session,
		isHost: state.user?.username === state.session?.hostUsername,
	}));

export const useUIState = () =>
	useTriviaStore((state) => ({
		error: state.error,
		loading: state.loading,
	}));
