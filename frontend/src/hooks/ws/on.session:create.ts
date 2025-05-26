import { useState } from "react";
import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";
import type { ClientResponseWithError } from "@shared/events.types";

export function useCreateSession() {
	const client = useTriviaClient();
	const setState = useTriviaStore((s) => s.setState);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const createSession = async (username: string): Promise<boolean> => {
		setError(null);
		setIsLoading(true);

		try {
			const response: ClientResponseWithError<"session:create"> =
				await client.request("session:create", {
					username,
				});

			if (response.success) {
				const { user, session } = response.data;
				setState({ user, session });
				setIsLoading(false);
				return true;
			}

			setError(response.error?.message ?? "Failed to create session");
			setIsLoading(false);
			return false;
		} catch (err) {
			setError("Network error occurred");
			setIsLoading(false);
			return false;
		}
	};

	const clearError = () => setError(null);

	return { createSession, error, isLoading, clearError };
}
