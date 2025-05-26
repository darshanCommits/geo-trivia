import {
	fetchMockQuestions,
	fetchQuestions,
} from "@backend/services/question.service";
import type { Question } from "@shared/core.types";
import type { Request, Response } from "express";

type ErrorResponse = {
	message: string;
};

type QueryType = {
	city: string;
	queCount: number;
};

export async function initializeQuestions(
	req: Request<any, Question[], QueryType>,
	res: Response<Question[] | ErrorResponse>,
) {
	const { city, queCount } = req.body;
	try {
		const questions = await fetchMockQuestions();

		console.log(questions);
		res.status(200).json(questions);
	} catch (error) {
		console.error("Failed to initialize questions:", error);
		res.status(500).json({ message: "Failed to initialize questions." });
	}
}
