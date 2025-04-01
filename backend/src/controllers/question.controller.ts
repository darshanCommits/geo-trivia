import type { Request, Response } from "express";
import QuestionService from "#/services/question.service";

// Assuming you have environment variables set up
const CITY = process.env.CITY || "New York";
const questionService = new QuestionService(CITY);

export const initializeQuestions = async (req: Request, res: Response) => {
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
	if (!questionService) {
		res.status(500).send({ message: "Question service not initialized." });
	}

	const question = questionService.nextQuestion();

	if (question) {
		res.status(200).json(question);
	}

	res.status(204).send({ message: "No more questions." }); // 204 No Content
};

export const resetQuestions = (_: Request, res: Response) => {
	if (!questionService) {
		res.status(500).send({ message: "Question service not initialized." });
	}

	questionService.reset();
	res.status(200).send({ message: "Questions reset." });
};
