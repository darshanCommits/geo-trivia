import { type ZodType } from "zod";
import { type Schema } from "./geminiExports";
export default function toZodGem<T>(zodType: ZodType<T>, fieldName?: string, fieldDescription?: string): Schema;
