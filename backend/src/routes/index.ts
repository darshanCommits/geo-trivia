import type { Express } from "express";
import { getNextQuestion } from "#/controllers/questionControllers";

export const setupRoutes = (app: Express): void => {
	app.get("/next", getNextQuestion);
};
