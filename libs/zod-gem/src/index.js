import { ZodArray, ZodBoolean, ZodEnum, ZodNumber, ZodObject, ZodString, ZodUnion, } from "zod";
import { Type } from "./geminiExports";
import { createBaseSchema, unwrapZodType } from "./helper";
import * as mapper from "./mappers";
export default function toZodGem(zodType, fieldName = "", fieldDescription = "") {
    const { innerType, isNullable } = unwrapZodType(zodType);
    const baseSchema = createBaseSchema(isNullable, fieldName, fieldDescription);
    if (innerType instanceof ZodUnion) {
        return {
            ...baseSchema,
            anyOf: innerType._def.options.map((option) => toZodGem(option, fieldName, fieldDescription)),
        };
    }
    if (innerType instanceof ZodString) {
        return mapper.mapZodStringToGemini(innerType, baseSchema);
    }
    if (innerType instanceof ZodNumber) {
        return mapper.mapZodNumberToGemini(innerType, baseSchema);
    }
    if (innerType instanceof ZodBoolean) {
        return {
            ...baseSchema,
            type: Type.BOOLEAN,
        };
    }
    if (innerType instanceof ZodEnum) {
        return {
            ...baseSchema,
            type: Type.STRING,
            enum: innerType._def.values,
            format: "enum",
        };
    }
    if (innerType instanceof ZodArray) {
        return mapper.mapZodArrayToGemini(innerType, baseSchema, fieldName, toZodGem);
    }
    if (innerType instanceof ZodObject) {
        return mapper.mapZodObjectToGemini(innerType, baseSchema, toZodGem);
    }
    return {
        ...baseSchema,
        type: Type.STRING,
        description: `Unsupported Zod type: ${innerType.constructor.name}`,
    };
}
//# sourceMappingURL=index.js.map