import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app";

const rootElement = document.getElementById("root");

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a query client
const queryClient = new QueryClient();

if (rootElement) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</React.StrictMode>,
	);
} else {
	console.error("Failed to find the root element");
}
