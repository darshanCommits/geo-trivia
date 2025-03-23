import type { QuestionType } from "%/types";
import express, { type Request, type Response } from "express";

const app = express();
const port = 3000;

const data: QuestionType[] = [
	{
		id: 1,
		question: "What is the capital of ",
		options: ["London", "Paris", "Berlin", "Rome"],
		correctAnswer: 1,
	},
	{
		id: 2,
		question: "What is the highest mountain in the world?",
		options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"],
		correctAnswer: 2,
	},
];

let currentIndex = 0;

app.get("/next", (_: Request, res: Response) => {
	if (currentIndex < data.length) {
		const value = data[currentIndex];
		currentIndex++;
		res.send(value);
	} else {
		res.send("hu");
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
