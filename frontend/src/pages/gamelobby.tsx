import { useState } from "react";
import { useTriviaGame } from "@/provider/trivia.provider";

import SessionInfoCard from "@/components/SessionInfo";
import PlayersList from "./PlayerList";
import GameStatusCard from "./GameStatusCard";
import GameControls from "./GameControls";
import InstructionsCard from "./InstructionsCard";

export default function GameLobby() {
	const { user, session, loading, error, startGame, leaveSession, clearError } =
		useTriviaGame();

	const [copied, setCopied] = useState(false);
	const [startingGame, setStartingGame] = useState(false);

	const handleCopySessionId = async () => {
		if (session?.id) {
			try {
				await navigator.clipboard.writeText(session.id);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (err) {
				console.error("Failed to copy session ID:", err);
			}
		}
	};

	const handleStartGame = async () => {
		setStartingGame(true);
		clearError();
		try {
			await startGame();
		} finally {
			setStartingGame(false);
		}
	};

	const handleLeaveSession = async () => {
		clearError();
		await leaveSession();
	};

	if (!session || !user) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
				<div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-6 text-center rounded-lg shadow">
					<p className="text-gray-600">No active session found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
			<div className="max-w-4xl mx-auto">
				<header className="text-center mb-6">
					<h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
					<p className="text-gray-300">Waiting for players to join...</p>
				</header>

				<SessionInfoCard
					session={session}
					copied={copied}
					onCopy={handleCopySessionId}
				/>

				{error && (
					<div className="mb-6 border-red-200 bg-red-50 rounded p-3">
						<p className="text-red-800">{error}</p>
					</div>
				)}

				<div className="grid gap-6 md:grid-cols-3">
					<PlayersList session={session} currentUser={user} />

					<div className="space-y-4">
						<GameStatusCard session={session} user={user} />

						<GameControls
							user={user}
							canStartGame={true}
							startingGame={startingGame}
							loading={loading}
							onStartGame={handleStartGame}
							onLeaveSession={handleLeaveSession}
						/>

						<InstructionsCard />
					</div>
				</div>
			</div>
		</div>
	);
}
