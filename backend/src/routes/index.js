import { Router } from "express";
import { getNextQuestion, initializeQuestions, } from "@backend/controllers/question.controller";
export const setupRoutes = (app) => {
    const router = Router();
    router.get("/questions/next", getNextQuestion);
    router.post("/questions/init", initializeQuestions);
    app.use("/api", router);
};
//# sourceMappingURL=index.js.map