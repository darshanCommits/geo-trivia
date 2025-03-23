import type { QuestionType } from "%/types";
import { questions } from "../data/questions";

class QuestionService {
	private currentIndex = 0;

	getNextQuestion(): QuestionType | string {
		if (this.currentIndex < questions.length) {
			const question = questions[this.currentIndex];
			this.currentIndex++;
			return question;
		}
		return "finished";
	}

	resetQuestions(): void {
		this.currentIndex = 0;
	}
}

export const questionService = new QuestionService();
