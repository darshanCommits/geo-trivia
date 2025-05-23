import { useEffect, useState } from "react";
import { useSessionStore } from "@/stores/sessionStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";
import { useNavigate } from "@tanstack/react-router";

export function GameLobby() {
	const navigate = useNavigate();
	const store = useSessionStore();
	const setSessionState = store.setSessionState;

	const { leaveSession } = useSession({
		onUserLeave: ({ sessionId, username }) => {
			console.log({ server: sessionId });
			console.log({ store: store.sessionId });
			console.log(`${username} left the session ${sessionId}.`);
			navigate({ to: "/session" });
		},
	});
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		if (store.sessionId) {
			await navigator.clipboard.writeText(store.sessionId);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	useEffect(() => {
		console.log(store.users);
	}, [store.users]);

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
								{store.sessionId}
							</Button>
							<p className="text-sm text-muted-foreground mt-1">
								{copied ? "Copied!" : "Click to copy and share with others"}
							</p>
						</CardTitle>
						<div className="text-sm text-center">
							<p>
								You are: <span className="font-medium">{store.username}</span>
							</p>
							{store.isHost && (
								<p className="text-sm text-green-600">You're the host</p>
							)}
						</div>
					</CardHeader>

					<CardContent>
						<h2 className="text-lg font-semibold mb-2">Players Joined:</h2>
						<hr className="my-2" />
						<ol className="space-y-1 mb-4">
							{store.users.map((user) => (
								<li key={user.id} className="text-sm">
									{user.username} {user.id === store.hostId && "(Host)"}
								</li>
							))}
						</ol>

						<div className="flex justify-between mt-4">
							<Button
								variant="default"
								onClick={() => {
									if (store.sessionId && store.username)
										leaveSession({
											sessionId: store.sessionId,
											username: store.username,
										});
								}}
								className="px-4"
							>
								Leave Session
							</Button>
						</div>
					</CardContent>
				</Card>

				{store.isHost && (
					<div className="mt-4 text-center">
						<p className="text-sm text-muted-foreground mb-4">
							{store.users.length < 2
								? "Waiting for more players to join..."
								: "You can now start the game!"}
						</p>
						<Button
							size="lg"
							className="px-10 py-6 text-xl"
							onClick={() => {
								// todo
							}}
							disabled={() => {
								// todo
							}}
						>
							{
								(false ?? true) ? "Starting Game..." : "Start Game" // todo
							}
						</Button>
					</div>
				)}

				{store.isLoading && (
					<p className="text-center text-blue-600 mt-4">
						{store.status || "Loading..."}
					</p>
				)}
				{store.error && (
					<p className="text-center text-red-600 mt-4">{store.error}</p>
				)}
			</div>
		</div>
	);
}
