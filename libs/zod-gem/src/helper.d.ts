import type { Schema } from "./geminiExports";
import { type ZodType } from "zod";
type ZodUnwrapped = {
    innerType: ZodType<unknown>;
    isNullable: boolean;
};
export declare function unwrapZodType<T>(zodType: ZodType<T>): ZodUnwrapped;
export declare function createBaseSchema(isNullable: boolean, fieldName: string, fieldDescription: string): Schema;
export {};
