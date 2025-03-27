import type { Request, Response, Express } from "express";
import {
	getAllQuestions,
	getNextQuestion,
} from "#/controllers/questionControllers";

export const setupRoutes = (app: Express): void => {
	app.get("/next", getNextQuestion);
	app.get("/", getAllQuestions);
};
