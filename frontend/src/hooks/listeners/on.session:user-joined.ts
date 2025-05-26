import { useEffect } from "react";
import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";

export function useUserJoinedListener() {
	const client = useTriviaClient();
	const addUser = useTriviaStore((state) => state.addUser);

	useEffect(() => {
		client.on("session:user-joined", addUser);

		return () => {
			client.off("session:user-joined", addUser);
		};
	}, [client, addUser]);
}
