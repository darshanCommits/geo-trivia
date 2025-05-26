import { useState } from "react";

import SessionInfoCard from "@/components/SessionInfo";
import PlayersList from "./PlayerList";
import InstructionsCard from "./InstructionsCard";
import { useTriviaStore } from "@/stores/game.store";
import { Badge } from "@/components/ui/badge";
import { useUserJoinedListener } from "@/hooks/listeners/on.session:user-joined";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function GameLobby() {
	useUserJoinedListener();
	const user = useTriviaStore((state) => state.user);
	const session = useTriviaStore((state) => state.session);

	const [copied, setCopied] = useState(false);
	const [region, setRegion] = useState("");
	const [gameStarted, setGameStarted] = useState(false);

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

						<Button onClick={() => setGameStarted(true)}>Start Game</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
