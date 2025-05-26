import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";

export function useJoinSession() {
	const client = useTriviaClient();
	const setState = useTriviaStore((s) => s.setState);

	const joinSession = async (username: string, sessionId: string) => {
		try {
			const { user, session } = await client.request("session:join", {
				username,
				sessionId,
			});

			setState({
				user,
				session,
			});
		} catch (error) {
			console.error("Failed to join session:", error);
		}
	};

	return joinSession;
}
