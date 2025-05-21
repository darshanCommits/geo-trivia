import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "./useSocket";
import { Events, type Types } from "@shared/types"; // Adjust the import path

interface GameState {
	currentQuestion: Types.QuestionType | null;
	questionIndex: number;
	totalQuestions: number;
	answerResult: {
		username: string;
		isAnswerCorrect: boolean;
		answer: number;
	} | null;
	currentScores: Types.Score[];
	gameOver: boolean;
	finalScores: Types.Score[] | null;
	loading: boolean;
	error: string | null;
	timer: number | null;
}

const initialState: GameState = {
	currentQuestion: null,
	questionIndex: -1,
	totalQuestions: 0,
	answerResult: null,
	currentScores: [],
	gameOver: false,
	finalScores: null,
	loading: false,
	error: null,
	timer: null,
};

/**
 * Hook to manage game events. Pass in sessionId and username from useSession.
 */
export function useGameEvents(
	sessionId?: string | null,
	username?: string | null,
) {
	const { socket, isConnected, emit, on, off } = useSocket();
	const [gameState, setGameState] = useState<GameState>(initialState);
	const timerRef = useRef<number | null>(null);
	const startTimeRef = useRef<number>(0);
	const timeoutMsRef = useRef<number>(0);

	// Reset on disconnect or session change
	useEffect(() => {
		setGameState(initialState);
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	// Handlers
	const handleQuestionPrompt = useCallback(
		({
			question,
			index,
			total,
		}: { question: Types.QuestionType; index: number; total: number }) => {
			// Clear existing timer
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			// Initialize timer
			timeoutMsRef.current = question.timeout * 1000;
			startTimeRef.current = Date.now();
			setGameState((prev) => ({
				...prev,
				currentQuestion: question,
				questionIndex: index,
				totalQuestions: total,
				answerResult: null,
				gameOver: false,
				loading: false,
				error: null,
				timer: question.timeout,
			}));
			timerRef.current = setInterval(() => {
				const elapsed = Date.now() - startTimeRef.current;
				const remainingMs = Math.max(0, timeoutMsRef.current - elapsed);
				const remainingSec = Math.ceil(remainingMs / 1000);
				setGameState((prev) => ({ ...prev, timer: remainingSec }));
				if (remainingMs <= 0 && timerRef.current) {
					clearInterval(timerRef.current);
					timerRef.current = null;
				}
			}, 500);
		},
		[],
	);

	const handleAnswerResult = useCallback(
		({
			username: u,
			isAnswerCorrect,
			answer,
			scores,
		}: {
			username: string;
			isAnswerCorrect: boolean;
			answer: number;
			scores: Types.Score[];
		}) => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			setGameState((prev) => ({
				...prev,
				answerResult: { username: u, isAnswerCorrect, answer },
				currentScores: scores,
				loading: false,
			}));
		},
		[],
	);

	const handleGameOver = useCallback(
		({ finalScores }: { finalScores: Types.Score[] }) => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			setGameState((prev) => ({
				...prev,
				gameOver: true,
				finalScores,
				currentQuestion: null,
				timer: null,
				loading: false,
			}));
		},
		[],
	);

	const handleSessionClosed = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		setGameState(initialState);
	}, []);

	// Register events
	useEffect(() => {
		if (!socket) return;
		on(Events.QUESTION_PROMPT, handleQuestionPrompt);
		on(Events.ANSWER_RESULT, handleAnswerResult);
		on(Events.GAME_OVER, handleGameOver);
		on(Events.SESSION_CLOSED, handleSessionClosed);
		return () => {
			off(Events.QUESTION_PROMPT, handleQuestionPrompt);
			off(Events.ANSWER_RESULT, handleAnswerResult);
			off(Events.GAME_OVER, handleGameOver);
			off(Events.SESSION_CLOSED, handleSessionClosed);
		};
	}, [
		socket,
		on,
		off,
		handleQuestionPrompt,
		handleAnswerResult,
		handleGameOver,
		handleSessionClosed,
	]);

	// Actions
	const submitAnswer = useCallback(
		(answer: number) => {
			if (!isConnected) {
				setGameState((prev) => ({ ...prev, error: "Not connected to server" }));
				return;
			}
			if (!sessionId || !username) {
				setGameState((prev) => ({
					...prev,
					error: "No active session or username",
				}));
				return;
			}
			if (gameState.timer !== null && gameState.timer <= 0) {
				setGameState((prev) => ({ ...prev, error: "Time's up!" }));
				return;
			}
			setGameState((prev) => ({ ...prev, loading: true, error: null }));
			emit(Events.SUBMIT_ANSWER, { sessionId, username, answer });
		},
		[isConnected, sessionId, username, gameState.timer, emit],
	);

	const startGame = useCallback(() => {
		if (!isConnected) {
			setGameState((prev) => ({ ...prev, error: "Not connected to server" }));
			return;
		}
		if (!sessionId) {
			setGameState((prev) => ({ ...prev, error: "No active session" }));
			return;
		}
		setGameState((prev) => ({
			...prev,
			loading: true,
			error: null,
			gameOver: false,
			finalScores: null,
		}));
		emit(Events.START_GAME, { sessionId });
	}, [isConnected, sessionId, emit]);

	const resetGame = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		setGameState(initialState);
	}, []);

	// Helpers using passed username
	const hasAnswered = useCallback(() => {
		return gameState.answerResult?.username === username;
	}, [gameState.answerResult, username]);

	const getCurrentPlayerScore = useCallback(() => {
		return (
			gameState.currentScores.find((s) => s.username === username)?.score ?? 0
		);
	}, [gameState.currentScores, username]);

	const isPlayerInFirstPlace = useCallback(() => {
		const sorted = [...gameState.currentScores].sort(
			(a, b) => b.score - a.score,
		);
		return sorted[0]?.username === username;
	}, [gameState.currentScores, username]);

	return {
		...gameState,
		isConnected,
		submitAnswer,
		startGame,
		resetGame,
		hasAnswered,
		getCurrentPlayerScore,
		isPlayerInFirstPlace,
	};
}
