import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export function ErrorPage({ error }: { error: Error }) {
	const navigate = useNavigate();

	return (
		<div className="bg-emerald-300 flex flex-col items-center justify-center min-h-screen pattern-background ">
			<div className="bg-white text-foreground bg-background font-base p-8 border-2 shadow-shadow border-border flex flex-col items-center gap-6 max-w-md w-full">
				<h2 className="text-2xl font-bold text-center text-red-600">
					Oops! Something went wrong
				</h2>
				<p className="text-slate-600 dark:text-slate-300 text-center">
					{error.message || "Failed to load questions"}
				</p>
				<Button
					onClick={() => navigate({ to: "/" })}
					className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
				>
					Return Home
				</Button>
			</div>
		</div>
	);
}
