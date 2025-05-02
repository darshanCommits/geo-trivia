import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/home";
import LoginPage from "@/pages/auth";
import GamePage from "@/pages/game";
import LeaderBoard from "@/pages/leaderboard";

const rootElement = document.getElementById("root");
const queryClient = new QueryClient();

function AppRoutes() {
	return (
		<BrowserRouter>
			{/* TODO: */}
			<Routes>
				<Route path="/" element={<Home />} />
			</Routes>

			<Routes>
				<Route path="/auth" element={<LoginPage />} />
			</Routes>
			<Routes>
				<Route path="/game" element={<GamePage />} />
			</Routes>

			{/* TODO: */}
			<Routes>
				<Route path="/leaderboard" element={<LeaderBoard />} />
			</Routes>
		</BrowserRouter>
	);
}

if (rootElement) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode >
			<QueryClientProvider client={queryClient}>
				<AppRoutes />
			</QueryClientProvider>
		</React.StrictMode>,
	);
} else {
	console.error("Failed to find the root element");
}
