// components/JoinSessionForm.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function JoinSessionForm({
	joinUsername,
	setJoinUsername,
	joinSessionId,
	setJoinSessionId,
	handleJoinSession,
	loading,
}: {
	joinUsername: string;
	setJoinUsername: (v: string) => void;
	joinSessionId: string;
	setJoinSessionId: (v: string) => void;
	handleJoinSession: () => void;
	loading: boolean;
}) {
	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="join-username">Your Username</Label>
				<Input
					id="join-username"
					type="text"
					placeholder="Enter your username"
					value={joinUsername}
					onChange={(e) => setJoinUsername(e.target.value)}
					disabled={loading}
					className="w-full"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="session-id">Session ID</Label>
				<Input
					id="session-id"
					type="text"
					placeholder="Enter session ID"
					value={joinSessionId}
					onChange={(e) => setJoinSessionId(e.target.value)}
					disabled={loading}
					className="w-full"
				/>
			</div>

			<Button
				onClick={handleJoinSession}
				className="w-full"
				disabled={loading || !joinUsername.trim() || !joinSessionId.trim()}
			>
				{loading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Joining...
					</>
				) : (
					"Join Session"
				)}
			</Button>
		</div>
	);
}
