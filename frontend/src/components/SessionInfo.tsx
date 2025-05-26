import { Users, Copy, Check } from "lucide-react"; // or wherever icons come from
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GameSession } from "@shared/core.types";

type Props = {
	sessionId: string;
	copied: boolean;
	onCopy: () => void;
};

export default function SessionInfoCard({ sessionId, copied, onCopy }: Props) {
	console.log(sessionId);
	return (
		<Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-2xl">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Session: {sessionId}
						</CardTitle>
						<CardDescription>
							Share this ID with friends to let them join
						</CardDescription>
					</div>
					<Button
						variant="bare"
						size="sm"
						onClick={onCopy}
						className="flex items-center gap-2"
					>
						{copied ? (
							<>
								<Check className="h-4 w-4 text-green-600" />
								Copied!
							</>
						) : (
							<>
								<Copy className="h-4 w-4" />
								Copy ID
							</>
						)}
					</Button>
				</div>
			</CardHeader>
		</Card>
	);
}
