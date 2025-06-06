import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import TitleHeader from "@/components/ui/title-header";
import { useTriviaStore } from "@/stores/game.store";
import type { Leaderboard } from "@shared/core.types";
import { Link } from "@tanstack/react-router";

// type Player = {
// 	id: number;
// 	name: string;
// 	score: number;
// 	rank: number;
// };

// const mockPlayers: Player[] = [
// 	{ id: 1, name: "Alex", score: 1200, rank: 1 },
// 	{ id: 2, name: "Sam", score: 1100, rank: 2 },
// 	{ id: 3, name: "Jordan", score: 1000, rank: 3 },
// 	{ id: 4, name: "Taylor", score: 900, rank: 4 },
// 	{ id: 5, name: "Casey", score: 800, rank: 5 },
// 	{ id: 6, name: "Riley", score: 700, rank: 6 },
// 	{ id: 7, name: "Morgan", score: 600, rank: 7 },
// 	{ id: 8, name: "Morgan", score: 600, rank: 7 },
// 	{ id: 9, name: "Morgan", score: 600, rank: 7 },
// 	{ id: 10, name: "Morgan", score: 600, rank: 7 },
// ];

function Podium(props: { topThree: Leaderboard }) {
	const colors = ["bg-yellow-300", "bg-gray-300", "bg-orange-400"];
	const maxHeight = 120;

	const heightRatios = [1, 0.75, 0.5]; // 1st: 100%, 2nd: 75%, 3rd: 50%

	return (
		<div className="flex justify-center items-end gap-4 ">
			{props.topThree.map((player, index) => (
				<div
					key={player.username}
					className={`flex flex-col items-center ${index === 1 ? "order-first" : ""}`}
				>
					<div
						style={{ height: `${maxHeight * heightRatios[index]}px` }}
						className={`w-24 ${colors[index]} border-2 border-black flex items-center justify-center text-black font-bold text-xl shadow-shadow`}
					>
						{player.score}
					</div>
					<div className="mt-2 text-base font-bold">{player.username}</div>
					<div className="text-sm">#{player.rank}</div>
				</div>
			))}
		</div>
	);
}

function OtherList(props: { restPlayers: Leaderboard }) {
	return (
		<div className="space-y-2 bg-white w-full p-4 px-8 border-2  shadow-shadow">
			{props.restPlayers.map((x) => (
				<div key={x.username} className="flex justify-between border-2 px-8">
					<span>#{x.username}</span>
					<span>{x.score}</span>
				</div>
			))}
		</div>
	);
}

export default function LeaderBoard() {
	const endGameList = useTriviaStore((s) => s.leaderboard);

	if (!endGameList) {
		throw new Error("Leaderboard is null");
	}

	const topThree = endGameList.slice(0, 3);
	const restPlayers = endGameList.slice(3);

	return (
		<main className="min-h-screen bg-orange-300 pattern-background flex flex-col items-center justify-center gap-8">
			<TitleHeader variant="bare" className=" absolute top-10 left-10 w-80" />

			<Section className="w-full max-w-4xl bg-blue-400 flex items-center">
				<h1 className="text-4xl font-extrabold tracking-tight text-right">
					Leaderboard
				</h1>
				<Podium topThree={topThree} />
				<OtherList restPlayers={restPlayers} />
			</Section>

			<Link to="/">
				<Button>Back to Home</Button>
			</Link>
		</main>
	);
}
