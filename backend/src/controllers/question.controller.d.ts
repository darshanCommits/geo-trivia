import type { Request, Response } from "express";
export declare const initializeQuestions: (_: Request, res: Response) => Promise<void>;
export declare const getNextQuestion: (_: Request, res: Response) => void;
