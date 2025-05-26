import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { TriviaGameProvider } from "@/provider/trivia.provider";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const rootElement = document.getElementById("root")!;
const queryClient = new QueryClient();
const serverUrl = "http://localhost:3000";

function Index() {
	return (
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<TriviaGameProvider serverUrl={serverUrl}>
					<RouterProvider router={router} />
				</TriviaGameProvider>
				);
			</QueryClientProvider>
		</React.StrictMode>
	);
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<Index />);
}
