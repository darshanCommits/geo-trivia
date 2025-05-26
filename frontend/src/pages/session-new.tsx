import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { SessionTabs } from "@/components/SessionTabs";
import { Gamepad2 } from "lucide-react";
import { useTriviaGame } from "@/provider/trivia.provider";
import { useNavigate } from "@tanstack/react-router";

export default function SessionPage() {
	const { loading, error, createSession, joinSession, clearError } =
		useTriviaGame();
	const navigate = useNavigate();

	const [createUsername, setCreateUsername] = useState("");
	const [joinUsername, setJoinUsername] = useState("");
	const [joinSessionId, setJoinSessionId] = useState("");

	const handleCreateSession = async () => {
		if (!createUsername.trim()) return;
		clearError();
		await createSession(createUsername.trim());
		navigate({ to: "/lobby" });
	};

	const handleJoinSession = async () => {
		if (!joinUsername.trim() || !joinSessionId.trim()) return;
		clearError();
		await joinSession({
			username: joinUsername.trim(),
			sessionId: joinSessionId.trim(),
		});
		navigate({ to: "/lobby" });
	};

	return (
		<div className="min-h-screen bg-blue-50 pattern-background flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-6">
					<Gamepad2 className="h-12 w-12 mx-auto mb-4 text-black" />
					<h1 className="text-3xl font-bold mb-2">Trivia Game</h1>
					<p className="text-gray-700">Join or create a game session</p>
				</div>

				<Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
					<CardHeader>
						<CardTitle className="text-center">Game Session</CardTitle>
						<CardDescription className="text-center">
							Choose how you'd like to participate
						</CardDescription>
					</CardHeader>
					<CardContent>
						<SessionTabs
							error={error}
							loading={loading}
							createUsername={createUsername}
							setCreateUsername={setCreateUsername}
							handleCreateSession={handleCreateSession}
							joinUsername={joinUsername}
							setJoinUsername={setJoinUsername}
							joinSessionId={joinSessionId}
							setJoinSessionId={setJoinSessionId}
							handleJoinSession={handleJoinSession}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
