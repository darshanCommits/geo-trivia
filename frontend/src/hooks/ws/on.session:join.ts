import { useState } from "react";
import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";
import type { SessionErrorEvents } from "@shared/events.types";
import type {
	ClientErrorResponse,
	ClientResponseWithError,
} from "@shared/events.types";

type JoinError = {
	reason: string;
	message: string;
};

type JoinFailed = SessionErrorEvents["session:join-failed"];

export function useJoinSession() {
	const client = useTriviaClient();
	const setState = useTriviaStore((s) => s.setState);
	const [error, setError] = useState<JoinError | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const joinSession = async (
		username: string,
		sessionId: string,
	): Promise<boolean> => {
		setError(null);
		setIsLoading(true);

		try {
			const response = await client.request("session:join", {
				username,
				sessionId,
			});

			if (response.success) {
				const { user, session } = response.data;
				setState({ user, session });
				setIsLoading(false);
				return true;
			}

			// response is an error object here
			const err = response.error as
				| JoinFailed
				| { message?: string; reason?: string };

			console.table(err);
			setError({
				reason: err.reason ?? "unknown",
				message: err.message ?? "Failed to join session",
			});
			setIsLoading(false);
			return false;
		} catch (err) {
			setError({
				reason: "network",
				message: "Network error occurred",
			});
			setIsLoading(false);
			return false;
		}
	};

	const clearError = () => setError(null);

	return {
		joinSession,
		error,
		isLoading,
		clearError,
	};
}
