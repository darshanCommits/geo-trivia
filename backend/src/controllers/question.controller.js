import QuestionService from "@backend/services/question.service";
const QUE_COUNT = 10;
const CITY = process.env.CITY || "Udaipur";
const questionService = new QuestionService(CITY, QUE_COUNT);
export const initializeQuestions = async (_, res) => {
    questionService.setCity(CITY);
    try {
        await questionService.fetchQuestions();
        res.status(200).send({ message: "Questions initialized successfully." });
    }
    catch (error) {
        console.error("Failed to initialize questions:", error);
        res.status(500).send({ message: "Failed to initialize questions." });
    }
};
export const getNextQuestion = (_, res) => {
    if (!questionService) {
        res.status(500).send({ message: "Question service not initialized." });
    }
    const question = questionService.getNextQuestion();
    if (question) {
        res.status(200).send(question);
    }
    else {
        res.status(200).send({ message: "No more questions." });
    }
};
//# sourceMappingURL=question.controller.js.map