import { fetchQuestions } from "@backend/services/question.service";
import type { QuestionType } from "@shared/types";
import type { Request, Response } from "express";

type ErrorResponse = {
	message: string;
};

type QueryType = {
	city: string;
	queCount: number;
};

export async function initializeQuestions(
	req: Request<any, QuestionType[], QueryType>,
	res: Response<QuestionType[] | ErrorResponse>,
) {
	const { city, queCount } = req.body;
	try {
		const questions = await fetchQuestions(city, queCount);

		console.log(questions);
		res.status(200).json(questions);
	} catch (error) {
		console.error("Failed to initialize questions:", error);
		res.status(500).json({ message: "Failed to initialize questions." });
	}
}
