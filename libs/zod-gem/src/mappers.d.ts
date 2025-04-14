import type { ZodTypeAny, ZodRawShape, ZodArray, ZodNumber, ZodObject, ZodString } from "zod";
import { type Schema } from "./geminiExports";
export declare function mapZodStringToGemini(stringType: ZodString, baseSchema: Schema): Schema;
export declare function mapZodNumberToGemini(numberType: ZodNumber, baseSchema: Schema): Schema;
export declare function mapZodArrayToGemini(arrayType: ZodArray<ZodTypeAny>, baseSchema: Schema, fieldName: string, mapFn: (type: ZodTypeAny, name: string, desc: string) => Schema): Schema;
export declare function mapZodObjectToGemini(objectType: ZodObject<ZodRawShape>, baseSchema: Schema, mapFn: (type: ZodTypeAny, name: string, desc: string) => Schema): Schema;
