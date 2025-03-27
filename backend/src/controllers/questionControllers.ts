import type { Request, Response } from "express";
import { questionService } from "../services/questionService";
import { questions } from "#/data/questions";

export const getNextQuestion = (_: Request, res: Response): void => {
	const question = questionService.getNextQuestion();
	res.send(question);
};

export const getAllQuestions = (_: Request, res: Response) => {
	res.send(questions);
};
