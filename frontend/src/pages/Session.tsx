import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionForm } from "@/components/SessionCard";
import { useSessionStore } from "@/stores/sessionStore";
import { useSession } from "@/hooks/useSession";

export default function Session() {
	const navigate = useNavigate();
	const [tab, setTab] = useState<"host" | "join">("host");
	const [formData, setFormData] = useState({ sessionId: "", username: "" });
	const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

	const store = useSessionStore();

	const setSessionState = store.setSessionState;

	const { createSession, joinSession, isConnected } = useSession({
		onSessionCreated: ({ sessionId, username }) => {
			console.log({ server: sessionId });
			console.log({ store: store.sessionId });
			console.log(`${username} created the session ${sessionId}.`);
			navigate({ to: "/lobby" });
		},
		onSessionExists: () => {
			setStatus("error");
			// alert("Session already exists. Try joining instead.");
		},
		onUsernameTaken: () => {
			setStatus("error");
			alert("Username already taken in this session.");
		},
		onUserJoined: ({ sessionId, username }) => {
			console.log({ server: sessionId });
			console.log({ store: store.sessionId });
			setSessionState({ sessionId, username, isHost: false });
			console.log({ server: sessionId });
			console.log({ store: store.sessionId });
			console.log(`${username} joined the session ${sessionId}.`);
			navigate({ to: "/lobby" });
		},
	});

	// Handlers
	const handleSubmit = () => {
		if (!formData.sessionId || !formData.username) return;

		const sessionId = formData.sessionId;
		const username = formData.username;

		setSessionState({ sessionId, username });

		if (tab === "host") {
			createSession({ sessionId, username });
		} else {
			joinSession({ sessionId, username });
			setSessionState({ sessionId, username, isHost: false });
		}
	};

	return (
		<div className="flex items-center justify-center h-screen bg-blue-50 pattern-background">
			<Tabs
				value={tab}
				onValueChange={(v) => setTab(v as "host" | "join")}
				className="max-w-md"
			>
				<TabsList
					className={`grid grid-cols-2 transition-colors ${
						tab === "host" ? "bg-blue-200" : "bg-white"
					}`}
				>
					<TabsTrigger value="host">Host</TabsTrigger>
					<TabsTrigger value="join">Join</TabsTrigger>
				</TabsList>

				<TabsContent value="host">
					<SessionForm
						title="Host a Session"
						sessionId={formData.sessionId}
						username={formData.username}
						setSessionId={(id) =>
							setFormData((prev) => ({ ...prev, sessionId: id }))
						}
						setUsername={(name) =>
							setFormData((prev) => ({ ...prev, username: name }))
						}
						status={status}
						onSubmit={handleSubmit}
						disabled={!isConnected || status === "loading"}
					/>
				</TabsContent>

				<TabsContent value="join">
					<SessionForm
						title="Join a Session"
						sessionId={formData.sessionId}
						username={formData.username}
						setSessionId={(id) =>
							setFormData((prev) => ({ ...prev, sessionId: id }))
						}
						setUsername={(name) =>
							setFormData((prev) => ({ ...prev, username: name }))
						}
						status={status}
						onSubmit={handleSubmit}
						disabled={!isConnected || status === "loading"}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
