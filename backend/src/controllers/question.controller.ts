import type { Request, Response } from "express";
import QuestionService from "@backend/services/question.service";

const QUE_COUNT = 10;
const CITY = process.env.CITY || "Udaipur";

const questionService = new QuestionService(CITY, QUE_COUNT);

export const initializeQuestions = async (_: Request, res: Response) => {
	questionService.setCity(CITY);
	try {
		await questionService.fetchQuestions();
		res.status(200).send({ message: "Questions initialized successfully." });
	} catch (error) {
		console.error("Failed to initialize questions:", error);
		res.status(500).send({ message: "Failed to initialize questions." });
	}
};

export const getNextQuestion = (_: Request, res: Response) => {
	// is this needed?
	if (!questionService) {
		res.status(500).send({ message: "Question service not initialized." });
	}

	const question = questionService.getNextQuestion();

	if (question) {
		res.status(200).send(question);
	} else {
		res.status(200).send({ message: "No more questions." }); // instead of 204
	}
};
