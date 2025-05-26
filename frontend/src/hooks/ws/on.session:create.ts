import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";

export function useCreateSession() {
	const client = useTriviaClient();
	const setState = useTriviaStore((s) => s.setState);

	const createSession = async (username: string) => {
		try {
			const { user, session } = await client.request("session:create", {
				username,
			});

			setState({
				user: user,
				session: session,
			});
		} catch (error) {
			console.error("Failed to create session:", error);
		}
	};
	return createSession;
}
