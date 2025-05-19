import { useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useSessionSocket } from "@/hooks/useSessionSocket";

export default function ShareSession() {
	const { sessionId } = useSearch({ from: "/share" });
	const { users } = useSessionSocket();
	console.log(users);

	const handleStart = () => {
		console.log(users);
	};

	return (
		<div className="flex flex-col items-center justify-between h-[80vh] p-6">
			<div className="text-center mt-10">
				<h1 className="text-4xl font-bold mb-2">Session ID</h1>
				<p className="text-3xl font-mono text-blue-600">{sessionId}</p>
				<p className="text-sm text-muted-foreground mt-2">
					Share this ID for others to join
				</p>
			</div>

			<div className="mt-10 w-full max-w-sm">
				<h2 className="text-lg font-semibold mb-2">Players Joined:</h2>
				<ul className="border rounded p-4 space-y-1 bg-gray-50 dark:bg-gray-900">
					{users.map((u) => (
						<li key={u} className="text-sm">
							• {u}
						</li>
					))}
				</ul>
			</div>

			<div className="w-full flex justify-center mt-auto mb-10">
				<Button size="lg" className="px-10 py-6 text-xl" onClick={handleStart}>
					Start
				</Button>
			</div>
		</div>
	);
}
