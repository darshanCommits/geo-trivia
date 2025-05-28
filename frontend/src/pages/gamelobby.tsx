import { useState } from "react";
import SessionInfoCard from "@/components/SessionInfo";
import PlayersList from "./PlayerList";
import InstructionsCard from "./InstructionsCard";
import { useTriviaStore } from "@/stores/game.store";
import { Badge } from "@/components/ui/badge";
import { useUserJoinedListener } from "@/hooks/listeners/on.session:user-joined";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStartGame } from "@/hooks/ws/on.game:start";
import { LoadingPage } from "./loading";
import { useNavigate } from "@tanstack/react-router";
import { useGameStartedListener } from "@/hooks/listeners/on.game:started";

export default function GameLobby() {
	useUserJoinedListener();
	useGameStartedListener(); // This will handle navigation when game starts

	const { startGame, isLoading } = useStartGame();
	const user = useTriviaStore((state) => state.user);
	const session = useTriviaStore((state) => state.session);
	const sessionId = useTriviaStore((state) => state.session?.sessionId);
	const [copied, setCopied] = useState(false);
	const [region, setRegion] = useState("");

	const handleCopySessionId = async () => {
		if (session) {
			try {
				await navigator.clipboard.writeText(session.sessionId);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (err) {
				console.error("Failed to copy session ID:", err);
			}
		}
	};

	const handleStartGame = async () => {
		if (!sessionId) return;

		// Only start the game - don't handle navigation here
		// The useGameStartedListener will handle navigation for all clients
		await startGame(sessionId, region);
	};

	if (isLoading) {
		return <LoadingPage />;
	}

	if (!session || !user) {
		return (
			<div className="min-h-screen bg-purple-900 pattern-background flex items-center justify-center p-4">
				<Badge variant={"bare"} className="w-full max-w-md p-6">
					<p className="text-gray-600 text-lg">No active session found</p>
				</Badge>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-indigo-500 pattern-background-alt p-4">
			<div className="max-w-4xl mx-auto">
				<header className="text-center mb-6">
					<h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
					<p className="text-gray-300">Waiting for players to join...</p>
				</header>

				<SessionInfoCard
					sessionId={session.sessionId}
					copied={copied}
					onCopy={handleCopySessionId}
				/>

				<div className="grid gap-6 md:grid-cols-3">
					<PlayersList session={session} currentUser={user} />
					<div className="space-y-4">
						<InstructionsCard />
						<div>
							<label className="block text-white mb-1" htmlFor="region-input">
								Region
							</label>
							<Input
								id="region-input"
								placeholder="Enter your region"
								value={region}
								onChange={(e) => setRegion(e.target.value)}
							/>
						</div>
						<Button onClick={handleStartGame} disabled={isLoading}>
							{isLoading ? "Starting..." : "Start Game"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
