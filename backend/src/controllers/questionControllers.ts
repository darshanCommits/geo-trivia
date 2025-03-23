import type { Request, Response } from "express";
import { questionService } from "../services/questionService";

export const getNextQuestion = (_: Request, res: Response): void => {
	const question = questionService.getNextQuestion();
	res.send(question);
};
