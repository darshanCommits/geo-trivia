import { useEffect } from "react";
import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";
import type { GameSession, Leaderboard } from "@shared/core.types";

export function useGameFinishedListener() {
	const client = useTriviaClient();
	const setLeaderboard = useTriviaStore((state) => state.setLeaderboard);
	const setStatus = useTriviaStore((state) => state.setGameStatus);

	useEffect(() => {
		const handler = ({
			leaderboard,
			status,
		}: { leaderboard: Leaderboard; status: GameSession["status"] }) => {
			console.log("from finished hook");
			console.log(leaderboard);
			setStatus("finished");
			setLeaderboard(leaderboard);
			// Don't read status here - it will be stale
			// If you need to log status, do it in the component that uses this hook
		};

		client.on("game:finished", handler);
		return () => {
			client.off("game:finished", handler);
		};
	}, [client, setStatus, setLeaderboard]); // Include the setters in dependencies
}
