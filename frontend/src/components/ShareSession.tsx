import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingPage } from "@/pages/loading";
import { ErrorPage } from "@/pages/error";

import { useSessionSocket } from "@/hooks/useSessionSocket"; // Socket hook tied to session
import { useGameEvents } from "@/hooks/useGameEvents"; // Game logic hook (zustand + ws decoupled)
import { useGameStore } from "@/stores/gameStore"; // Zustand store for game state
import { useSessionStore } from "@/stores/sessionStore"; // Zustand store for session data

export default function ShareSession() {
	// Get sessionId from route search params
	const { sessionId } = useSearch({ from: "/share" });

	// Zustand session store (users, username, host status, error)
	const {
		username,
		users,
		isHost,
		error: sessionError,
	} = useSessionStore((state) => ({
		username: state.username,
		users: state.users,
		isHost: state.isHost,
		error: state.error,
	}));

	// Initialize session and socket hooks
	// These hooks internally connect and manage the websocket based on sessionId

	// Use the game store to get current game state and error
	const {
		isConnected,
		isLoading: gameLoading,
		error: gameError,
		startGame,
	} = useGameEvents(sessionId, username);

	// Clipboard copy state
	const [copied, setCopied] = useState(false);

	// Clipboard copy handler
	const handleCopy = async () => {
		if (sessionId) {
			await navigator.clipboard.writeText(sessionId);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	// Start game (only host)
	const handleStart = () => {
		if (isHost) {
			startGame();
		}
	};

	// Leave session handler (reset Zustand stores and navigate away if needed)
	const handleLeave = () => {
		// Reset session and game states
		useSessionStore.getState().resetSession();
		// TODO: navigate away, e.g. router.navigate("/")
	};

	// Show loading page if socket not connected or loading
	if (!isConnected || gameLoading) {
		return <LoadingPage />;
	}

	// Show error page if any error in session or game
	if (sessionError || gameError) {
		const errMsg = sessionError || gameError || "Something went wrong";
		return <ErrorPage error={new Error(errMsg)} />;
	}

	return (
		<div className="flex flex-col items-center justify-between p-6 gap-6 pattern-background min-h-screen">
			<div className="text-center w-full max-w-md">
				<h1 className="text-3xl font-bold mb-4">Game Session</h1>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex flex-col items-center">
							<div className="text-lg text-muted-foreground mb-1">
								Session ID
							</div>
							<Button
								onClick={handleCopy}
								variant="bare"
								className="text-2xl font-bold text-blue-600 hover:underline focus:outline-none"
								title="Click to copy"
							>
								{sessionId}
							</Button>
							<p className="text-sm text-muted-foreground mt-1">
								{copied ? "Copied!" : "Click to copy and share with others"}
							</p>
						</CardTitle>
						<div className="text-sm text-center">
							<p>
								You are: <span className="font-medium">{username}</span>
							</p>
							{isHost && (
								<p className="text-sm text-green-600">You're the host</p>
							)}
						</div>
					</CardHeader>

					<CardContent>
						<h2 className="text-lg font-semibold mb-2">Players Joined:</h2>
						<hr className="my-2" />
						<ol className="space-y-1 mb-4">
							{users.map((u, i) => (
								<li key={u.id} className="text-sm">
									{i + 1}. {u.username}
								</li>
							))}
						</ol>

						<div className="flex justify-between mt-4">
							<Button variant="default" onClick={handleLeave} className="px-4">
								Leave Session
							</Button>

							{isHost && (
								<Button
									onClick={handleStart}
									disabled={users.length < 2}
									className="px-6"
								>
									Start Game
								</Button>
							)}
						</div>
					</CardContent>
				</Card>

				{isHost && (
					<div className="mt-4 text-center">
						<p className="text-sm text-muted-foreground mb-4">
							{users.length < 2
								? "Waiting for more players to join..."
								: "You can now start the game!"}
						</p>
						<Button
							size="lg"
							className="px-10 py-6 text-xl"
							onClick={handleStart}
							disabled={users.length < 2}
						>
							Start Game
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
