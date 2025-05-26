import { useState } from "react";
import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";

export function useStartGame() {
	const client = useTriviaClient();
	const setGameStatus = useTriviaStore((s) => s.setGameStatus);
	const setTotalQuestions = useTriviaStore((s) => s.setTotalQuestions);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const startGame = async (
		sessionId: string,
		region: string,
	): Promise<boolean> => {
		setError(null);
		setIsLoading(true);

		try {
			const response = await client.request("game:start", {
				sessionId,
				region,
			});

			if (response.success) {
				setGameStatus(response.data.status);
				setTotalQuestions(response.data.totalQuestions);
				setIsLoading(false);
				return true;
			}

			setError(response.error?.message ?? "Failed to start the game");
			setIsLoading(false);
			return false;
		} catch (err) {
			setError("Network error occurred");
			setIsLoading(false);
			return false;
		}
	};

	const clearError = () => setError(null);

	return { startGame, error, isLoading, clearError };
}
