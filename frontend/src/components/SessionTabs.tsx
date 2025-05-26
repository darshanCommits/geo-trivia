// components/SessionTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gamepad2, Users } from "lucide-react";
import { JoinSessionForm } from "./JoinSession.form";
import { CreateSessionForm } from "./CreateSession.form";

export function SessionTabs({
	error,
	loading,
	createUsername,
	setCreateUsername,
	handleCreateSession,
	joinUsername,
	setJoinUsername,
	joinSessionId,
	setJoinSessionId,
	handleJoinSession,
}: any) {
	return (
		<Tabs defaultValue="join" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="join" className="flex items-center gap-2">
					<Users className="h-4 w-4" />
					Join Session
				</TabsTrigger>
				<TabsTrigger value="create" className="flex items-center gap-2">
					<Gamepad2 className="h-4 w-4" />
					Create Session
				</TabsTrigger>
			</TabsList>

			{error && (
				<Alert className="mt-4 border-red-200 bg-red-50">
					<AlertDescription className="text-red-800">{error}</AlertDescription>
				</Alert>
			)}

			<TabsContent value="join" className="space-y-4 mt-6">
				<JoinSessionForm
					joinUsername={joinUsername}
					setJoinUsername={setJoinUsername}
					joinSessionId={joinSessionId}
					setJoinSessionId={setJoinSessionId}
					handleJoinSession={handleJoinSession}
					loading={loading}
				/>
			</TabsContent>

			<TabsContent value="create" className="space-y-4 mt-6">
				<CreateSessionForm
					createUsername={createUsername}
					setCreateUsername={setCreateUsername}
					handleCreateSession={handleCreateSession}
					loading={loading}
				/>
			</TabsContent>
		</Tabs>
	);
}
