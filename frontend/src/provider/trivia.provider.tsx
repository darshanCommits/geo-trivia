import { createContext, useContext, useEffect, useRef } from "react";
import { TriviaGameClient } from "@/classes/TriviaGameClient";

interface TriviaClientContextValue {
	client: TriviaGameClient;
}

const TriviaClientContext = createContext<TriviaClientContextValue | null>(
	null,
);

export function TriviaClientProvider({
	children,
	serverUrl,
}: {
	children: React.ReactNode;
	serverUrl: string;
}) {
	const clientRef = useRef<TriviaGameClient | null>(null);

	if (!clientRef.current) {
		clientRef.current = new TriviaGameClient(serverUrl);
	}

	// Ensure client disconnects when provider unmounts(page refresh) to clean up
	useEffect(() => {
		return () => {

			clientRef.current?.disconnect();
		};
	}, []);

	return (
		<TriviaClientContext.Provider value={{ client: clientRef.current }}>
			{children}
		</TriviaClientContext.Provider>
	);
}

// Reusable client hook with guard
export function useTriviaClient(): TriviaGameClient {
	const context = useContext(TriviaClientContext);
	if (!context)
		throw new Error("useTriviaClient must be used within TriviaClientProvider");
	return context.client;
}
