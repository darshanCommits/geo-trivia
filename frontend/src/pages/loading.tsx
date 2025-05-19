import { Spinner } from "@/components/ui/spinner";

export function LoadingPage() {
	return (
		<div className="bg-emerald-300  flex flex-col items-center justify-center min-h-screen pattern-background pattern-move">
			<div className="bg-white text-foreground bg-background font-base p-8 border-2 shadow-shadow border-border">
				<h2 className="text-2xl font-bold text-center">
					Loading Quiz Questions
				</h2>
				<Spinner size="large" className="text-emerald-500 my-4" />
				<p className="text-slate-600 text-center">
					Preparing your quiz experience...
				</p>
			</div>
		</div>
	);
}
