import { type QuestionType } from "@shared/types";
declare class QuestionService {
    private city;
    private que_count;
    private questions;
    private index;
    private genAI;
    constructor(city: string, count: number);
    setCity(city: string): void;
    private generate;
    fetchQuestions(): Promise<void>;
    private setValidQuestions;
    getNextQuestion(): QuestionType | null;
}
export default QuestionService;
