import { useEffect, useState } from "react";
import { useSessionStore } from "@/stores/sessionStore"; // path to your session zustand store
import {
	type SessionStateSetterType,
	useSessionSocket,
} from "@/hooks/useSessionSocket"; // path to your session socket hook
import { useGameEvents } from "@/hooks/useGameEvents"; // path to your game events hook
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GameLobby() {
	const session = useSessionStore();
	const { leaveSession } = useSessionSocket({
		sessionState: session,
		setSessionState: session.setSessionState as SessionStateSetterType,
	});
	const { startGame, resetGame, isLoading: isGameLoading } = useGameEvents();
	const [copied, setCopied] = useState(false);

	// Effect to reset game state when entering the lobby
	useEffect(() => {
		// Reset game state if needed when returning to the lobby
		// This is useful if a game ended and the host decided not to play again immediately.
		// You might want to refine this logic based on your game flow.
		if (session.sessionId) {
			resetGame();
		}
	}, [session.sessionId, resetGame]);

	useEffect(() => {
		console.log("GameLobby - session.users:", session.users);
	}, [session.users]);

	const handleCopy = async () => {
		if (session.sessionId) {
			await navigator.clipboard.writeText(session.sessionId);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	if (!session.sessionId) {
		// This component should only be rendered when a session is active
		// You might want to navigate the user away or show a different message
		return (
			<div className="flex justify-center items-center h-screen text-xl text-gray-600">
				No active session. Please create or join one.
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-between p-6 gap-6 pattern-background min-h-screen">
			<div className="text-center w-full max-w-md">
				<h1 className="text-3xl font-bold mb-4">Game Lobby</h1>

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
								{session.sessionId}
							</Button>
							<p className="text-sm text-muted-foreground mt-1">
								{copied ? "Copied!" : "Click to copy and share with others"}
							</p>
						</CardTitle>
						<div className="text-sm text-center">
							<p>
								You are: <span className="font-medium">{session.username}</span>
							</p>
							{session.isHost && (
								<p className="text-sm text-green-600">You're the host</p>
							)}
						</div>
					</CardHeader>

					<CardContent>
						<h2 className="text-lg font-semibold mb-2">Players Joined:</h2>
						<hr className="my-2" />
						<ol className="space-y-1 mb-4">
							{session.users.map((user) => (
								<li key={user.id} className="text-sm">
									{user.username} {user.id === session.hostId && "(Host)"}
								</li>
							))}
						</ol>

						<div className="flex justify-between mt-4">
							<Button
								variant="default"
								onClick={() => leaveSession()}
								className="px-4"
							>
								Leave Session
							</Button>
						</div>
					</CardContent>
				</Card>

				{session.isHost && (
					<div className="mt-4 text-center">
						<p className="text-sm text-muted-foreground mb-4">
							{session.users.length < 2
								? "Waiting for more players to join..."
								: "You can now start the game!"}
						</p>
						<Button
							size="lg"
							className="px-10 py-6 text-xl"
							onClick={() => startGame()}
							disabled={session.users.length < 2 || isGameLoading}
						>
							{isGameLoading ? "Starting Game..." : "Start Game"}
						</Button>
					</div>
				)}

				{session.isLoading && (
					<p className="text-center text-blue-600 mt-4">
						{session.status || "Loading..."}
					</p>
				)}
				{session.error && (
					<p className="text-center text-red-600 mt-4">{session.error}</p>
				)}
			</div>
		</div>
	);
}
