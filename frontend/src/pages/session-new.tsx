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
import { useNavigate } from "@tanstack/react-router";
import { useCreateSession } from "@/hooks/ws/on.session:create";
import { useJoinSession } from "@/hooks/ws/on.session:join";
import { useTriviaStore } from "@/stores/game.store";

export default function SessionPage() {
	const navigate = useNavigate();
	const createSession = useCreateSession();
	const joinSession = useJoinSession();

	const [username, setUsername] = useState("");
	const [sessionId, setSessionId] = useState("");

	const handleCreateSession = async () => {
		if (!username.trim()) return;
		createSession(username);

		navigate({ to: "/lobby" });
	};

	const handleJoinSession = async () => {
		if (!username.trim() || !sessionId.trim()) return;
		joinSession(username, sessionId);

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
							username={username}
							setUsername={setUsername}
							sessionId={sessionId}
							setSessionId={setSessionId}
							handleCreateSession={handleCreateSession}
							handleJoinSession={handleJoinSession}
							loading={false}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
