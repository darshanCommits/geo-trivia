import { z } from "zod";
export const QuestionSchema = z.object({
    question: z
        .string()
        .max(100)
        .describe("Concise Question Description. Must be of <region>'s geopolitical and historical events."),
    options: z
        .array(z.string().max(50))
        .length(4)
        .describe("Array of potential answers. Must be of length"),
    correctAnswer: z
        .number()
        .int()
        .min(0)
        .max(3)
        .describe("Index of correct answer from <options>"),
    timeLimit: z.number().min(3).max(20).describe("Timeout for the question."),
    region: z
        .string()
        .describe("This can be either a city/state/country or a geographical hotspot like bermuda island."),
});
//# sourceMappingURL=types.js.map