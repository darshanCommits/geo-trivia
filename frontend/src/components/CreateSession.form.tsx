// components/CreateSessionForm.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function CreateSessionForm({
	createUsername,
	setCreateUsername,
	handleCreateSession,
	loading,
}: {
	createUsername: string;
	setCreateUsername: (v: string) => void;
	handleCreateSession: () => void;
	loading: boolean;
}) {
	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="create-username">Your Username</Label>
				<Input
					id="create-username"
					type="text"
					placeholder="Enter your username"
					value={createUsername}
					onChange={(e) => setCreateUsername(e.target.value)}
					disabled={loading}
					className="w-full"
				/>
			</div>

			<div className="p-2 bg-blue-50 border border-blue-200">
				<p className="text-sm text-blue-800">
					<strong>As the host:</strong> You'll be able to start the game once
					other players join your session.
				</p>
			</div>

			<Button
				onClick={handleCreateSession}
				className="w-full"
				disabled={loading || !createUsername.trim()}
			>
				{loading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Creating...
					</>
				) : (
					"Create Session"
				)}
			</Button>
		</div>
	);
}
