import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import TitleHeader from "@/components/ui/title-header";
import { Link } from "react-router";

export default function Home() {
	return (
		<main className="pattern-background min-h-screen flex flex-col items-center justify-center gap-16 px-6 py-12 text-center">
			<TitleHeader
				variant="bare"
				className="w-[30rem] absolute top-20 left020"
			/>
			<Section className="px-12">
				<div>
					<h1 className="text-4xl font-extrabold tracking-tight mb-2 inline-block relative underline underline-offset-2 decoration-red decoration-6">
						Test Your Geopolitical Skills. 
					</h1>
					<p className="text-lg text-main-foreground mt-4 font-medium">
						Challenge your geopolitical knowledge in real-time multiplayer
						trivia. <br />
						AI-powered, always fresh questions. Climb the leaderboard and
						compete with the world!
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 w-full justify-end">
					<Button size="lg">
						<Link to="/auth">Login Now</Link>
					</Button>
					<Button variant="neutral" size="lg">
						<Link to="/leaderboard">Leaderboard</Link>
					</Button>
				</div>
			</Section>
		</main>
	);
}
