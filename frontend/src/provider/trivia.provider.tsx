import { createContext, useContext, useEffect, useRef } from "react";
import { TriviaGameClient } from "@/classes/TriviaGameClient";
import { useTriviaStore } from "@/stores/game.store";
import type { User } from "@shared/types";

// Context just provides client and actions
interface TriviaGameContextValue {
	client: TriviaGameClient | null;

	// Actions that interact with the server
	createSession: (username: string) => Promise<void>;
	joinSession: (user: User) => Promise<void>;
	leaveSession: () => Promise<void>;
	startGame: () => Promise<void>;
	submitAnswer: (
		questionId: string,
		selectedOption: number,
		timeRemaining: number,
	) => Promise<void>;
	skipQuestion: () => Promise<void>;
}

const TriviaGameContext = createContext<TriviaGameContextValue | null>(null);

interface TriviaGameProviderProps {
	children: React.ReactNode;
	serverUrl: string;
}

export function TriviaGameProvider({
	children,
	serverUrl,
}: TriviaGameProviderProps) {
	const clientRef = useRef<TriviaGameClient | null>(null);

	// Get store actions
	const {
		setConnected,
		setUser,
		setSession,
		setCurrentQuestion,
		setLeaderboard,
		setGameResults,
		setError,
		setLoading,
		showQuestionEnd,
		handleUserJoined,
		handleUserLeft,
		handleSessionDeleted,
		resetGame,
	} = useTriviaStore();

	// Initialize client and event handlers
	useEffect(() => {
		const client = new TriviaGameClient(serverUrl);
		clientRef.current = client;

		// Connection events
		client.on("connect", () => {
			setConnected(true);
		});

		client.on("disconnect", () => {
			setConnected(false);
		});

		client.on("error", (error) => {
			setError(error.error);
		});

		// Session events
		client.on("session:user-joined", handleUserJoined);
		client.on("session:user-left", handleUserLeft);
		client.on("session:deleted", ({ sessionId, reason }) => {
			handleSessionDeleted(sessionId, reason);
		});

		// Game events
		client.on(
			"game:question",
			({ question, questionNumber, totalQuestions }) => {
				setCurrentQuestion({ ...question, questionNumber, totalQuestions });
			},
		);

		client.on(
			"game:question-end",
			({ correctAnswer, explanation, leaderboard }) => {
				showQuestionEnd(correctAnswer, explanation, leaderboard);
			},
		);

		client.on("game:finished", ({ results }) => {
			setGameResults(results);
		});

		// Error events - create a reusable error handler
		const handleError = (errorData: { reason: string; message: string }) => {
			setError(errorData.message);
		};

		client.on("session:create-failed", handleError);
		client.on("session:join-failed", handleError);
		client.on("session:leave-failed", handleError);
		client.on("game:start-failed", handleError);
		client.on("game:answer-failed", handleError);
		client.on("game:skip-failed", handleError);

		return () => {
			client.disconnect();
		};
	}, [
		serverUrl,
		setConnected,
		setError,
		handleUserJoined,
		handleUserLeft,
		handleSessionDeleted,
		setCurrentQuestion,
		showQuestionEnd,
		setGameResults,
	]);

	// Server action methods
	const createSession = async (username: string) => {
		if (!clientRef.current) return;

		setLoading(true);
		setError(null);

		try {
			const result = await clientRef.current.createSession(username);
			if ("error" in result) {
				setError(result.error);
			} else {
				setUser(result.user);
				setSession(result.session);
			}
		} catch (error) {
			setError("Failed to create session");
		} finally {
			setLoading(false);
		}
	};

	const joinSession = async (user: User) => {
		if (!clientRef.current) return;

		setLoading(true);
		setError(null);

		try {
			const result = await clientRef.current.joinSession(user);
			if ("error" in result) {
				setError(result.error);
			} else {
				setUser(result);
			}
		} catch (error) {
			setError("Failed to join session");
		} finally {
			setLoading(false);
		}
	};

	const leaveSession = async () => {
		if (!clientRef.current) return;

		try {
			await clientRef.current.leaveSession();
			setSession(null);
			resetGame();
		} catch (error) {
			setError("Failed to leave session");
		}
	};

	const startGame = async () => {
		if (!clientRef.current) return;

		setLoading(true);

		try {
			const result = await clientRef.current.startGame();
			if ("error" in result) {
				setError(result.error);
			} else {
				setSession(result.session);
			}
		} catch (error) {
			setError("Failed to start game");
		} finally {
			setLoading(false);
		}
	};

	const submitAnswer = async (
		questionId: string,
		selectedOption: number,
		timeRemaining: number,
	) => {
		if (!clientRef.current) return;

		try {
			const result = await clientRef.current.submitAnswer({
				questionId,
				selectedOption,
				timeRemaining,
			});

			if ("error" in result) {
				setError(result.error);
			}
			// Success handling is done via socket events
		} catch (error) {
			setError("Failed to submit answer");
		}
	};

	const skipQuestion = async () => {
		if (!clientRef.current) return;

		try {
			const result = await clientRef.current.skipQuestion();
			if ("error" in result) {
				setError(result.error);
			}
		} catch (error) {
			setError("Failed to skip question");
		}
	};

	const contextValue: TriviaGameContextValue = {
		client: clientRef.current,
		createSession,
		joinSession,
		leaveSession,
		startGame,
		submitAnswer,
		skipQuestion,
	};

	return (
		<TriviaGameContext.Provider value={contextValue}>
			{children}
		</TriviaGameContext.Provider>
	);
}

// Hook to get client and actions
export function useTriviaActions() {
	const context = useContext(TriviaGameContext);
	if (!context) {
		throw new Error("useTriviaActions must be used within TriviaGameProvider");
	}
	return context;
}

// Convenience hook that combines actions with store state
export function useTriviaGame() {
	const actions = useTriviaActions();
	const state = useTriviaStore();

	return {
		...state,
		...actions,
	};
}
