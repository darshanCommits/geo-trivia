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

export default function SessionPage() {
	const navigate = useNavigate();
	const { createSession } = useCreateSession();
	const {
		joinSession,
		error: joinError,
		isLoading,
		clearError,
	} = useJoinSession();
	const [username, setUsername] = useState("");
	const [sessionId, setSessionId] = useState("");

	const handleCreateSession = async () => {
		if (!username.trim()) return;
		createSession(username);
		navigate({ to: "/lobby" });
	};

	const handleJoinSession = async () => {
		if (!username.trim() || !sessionId.trim()) return;

		const success = await joinSession(username, sessionId);
		if (success) {
			navigate({ to: "/lobby" });
		}
		// If not successful, error will be shown via joinError
	};

	// Clear error when user starts typing (optional UX improvement)
	const handleUsernameChange = (value: string) => {
		setUsername(value);
		if (joinError) clearError();
	};

	const handleSessionIdChange = (value: string) => {
		setSessionId(value);
		if (joinError) clearError();
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
							setUsername={handleUsernameChange}
							sessionId={sessionId}
							setSessionId={handleSessionIdChange}
							handleCreateSession={handleCreateSession}
							handleJoinSession={handleJoinSession}
							loading={isLoading}
						/>
						{joinError && (
							<div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
								<p className="text-red-600 text-sm">{joinError.message}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
