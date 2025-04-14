import { z } from "zod";
export declare const QuestionSchema: z.ZodObject<{
    question: z.ZodString;
    options: z.ZodArray<z.ZodString, "many">;
    correctAnswer: z.ZodNumber;
    timeLimit: z.ZodNumber;
    region: z.ZodString;
}, "strip", z.ZodTypeAny, {
    question: string;
    options: string[];
    correctAnswer: number;
    timeLimit: number;
    region: string;
}, {
    question: string;
    options: string[];
    correctAnswer: number;
    timeLimit: number;
    region: string;
}>;
export type QuestionType = z.infer<typeof QuestionSchema>;
