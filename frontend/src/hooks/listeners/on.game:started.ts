import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";
import { useRequestNextQuestion } from "@/hooks/ws/on.game:next-question";

export function useGameStartedListener() {
	const client = useTriviaClient();
	const navigate = useNavigate();
	const { requestNextQuestion } = useRequestNextQuestion();
	const sessionId = useTriviaStore((s) => s.session?.sessionId);
	const setGameStatus = useTriviaStore((s) => s.setGameStatus);
	const setTotalQuestions = useTriviaStore((s) => s.setTotalQuestions);

	useEffect(() => {
		const handleGameStarted = async (data: any) => {
			console.log("Game started event received:", data);

			// Update store with game data
			setGameStatus(data.status);
			setTotalQuestions(data.totalQuestions);

			// Navigate to game page
			navigate({ to: "/game" });

			// Request the first question after navigation
			if (sessionId) {
				try {
					await requestNextQuestion({
						sessionId,
						currentQuestionNumber: 0,
					});
				} catch (error) {
					console.error("Failed to request first question:", error);
				}
			}
		};

		// Listen for game started event
		client.on("game:started", handleGameStarted);

		return () => {
			client.off("game:started", handleGameStarted);
		};
	}, [
		client,
		navigate,
		requestNextQuestion,
		sessionId,
		setGameStatus,
		setTotalQuestions,
	]);
}
