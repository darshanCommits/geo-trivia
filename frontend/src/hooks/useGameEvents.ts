import { useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import { Events, type Types } from "@shared/types";
import { useGameStore } from "@/stores/gameStore"; // path to your zustand store

export function useGameEvents(
	sessionId?: string | null,
	username?: string | null,
) {
	const { socket, isConnected, emit, on, off } = useSocket();

	// Get state setters and state from store
	const {
		setCurrentQuestion,
		setAnswerResult,
		setGameOver,
		setSessionClosed,
		setLoading,
		setError,
		reset,
		...gameState
	} = useGameStore();

	// Event handlers
	const handleQuestionPrompt = useCallback(
		({
			question,
			index,
			total,
		}: { question: Types.QuestionType; index: number; total: number }) => {
			setCurrentQuestion(question, index, total);
		},
		[setCurrentQuestion],
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
			setAnswerResult(u, isAnswerCorrect, answer, scores);
		},
		[setAnswerResult],
	);

	const handleGameOver = useCallback(
		({ finalScores }: { finalScores: Types.Score[] }) => {
			setGameOver(finalScores);
		},
		[setGameOver],
	);

	const handleSessionClosed = useCallback(() => {
		setSessionClosed();
	}, [setSessionClosed]);

	// Register / unregister socket events
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
				setError("Not connected to server");
				return;
			}
			if (!sessionId || !username) {
				setError("No active session or username");
				return;
			}
			if (gameState.timer !== null && gameState.timer <= 0) {
				setError("Time's up!");
				return;
			}
			setLoading(true);
			setError(null);
			emit(Events.SUBMIT_ANSWER, { sessionId, username, answer });
		},
		[
			isConnected,
			sessionId,
			username,
			gameState.timer,
			emit,
			setLoading,
			setError,
		],
	);

	const startGame = useCallback(() => {
		if (!isConnected) {
			setError("Not connected to server");
			return;
		}
		if (!sessionId) {
			setError("No active session");
			return;
		}
		setLoading(true);
		setError(null);
		reset(); // reset gameOver, finalScores etc before starting
		emit(Events.START_GAME, { sessionId });
	}, [isConnected, sessionId, emit, setError, setLoading, reset]);

	const resetGame = useCallback(() => {
		reset();
	}, [reset]);

	// Helpers using username and current state
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
