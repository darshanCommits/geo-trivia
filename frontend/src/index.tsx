import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { SocketProvider } from "@/provider/socket.provider";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const rootElement = document.getElementById("root")!;
const queryClient = new QueryClient();

function Index() {
	return (
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<SocketProvider>
					<RouterProvider router={router} />
				</SocketProvider>
			</QueryClientProvider>
		</React.StrictMode>
	);
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<Index />);
}
