import { useEffect, useState } from "react";
import { useTriviaClient } from "@/provider/trivia.provider";

type JoinFailedError = {
	reason: string;
	message: string;
};

export function useJoinFailedListener() {
	const client = useTriviaClient();
	const [error, setError] = useState<JoinFailedError | null>(null);

	useEffect(() => {
		const handler = (err: JoinFailedError) => setError(err);

		client.on("session:join-failed", handler);
		return () => {
			client.off("session:join-failed", handler);
		};
	}, [client]);

	return error;
}
