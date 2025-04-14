import { ZodDefault, ZodEffects, ZodNullable, ZodOptional, } from "zod";
export function unwrapZodType(zodType) {
    let currentType = zodType;
    let isNullable = zodType instanceof ZodNullable;
    while (currentType instanceof ZodOptional ||
        currentType instanceof ZodNullable ||
        currentType instanceof ZodEffects ||
        currentType instanceof ZodDefault) {
        if (currentType instanceof ZodOptional) {
            isNullable = true;
            currentType = currentType._def.innerType;
        }
        else if (currentType instanceof ZodNullable) {
            isNullable = true;
            currentType = currentType._def.innerType;
        }
        else if (currentType instanceof ZodDefault) {
            currentType = currentType._def.innerType;
        }
        else if (currentType instanceof ZodEffects) {
            currentType = currentType._def.schema;
        }
    }
    return {
        innerType: currentType,
        isNullable,
    };
}
export function createBaseSchema(isNullable, fieldName, fieldDescription) {
    return {
        description: fieldDescription || `Field ${fieldName}`,
        nullable: isNullable,
    };
}
//# sourceMappingURL=helper.js.map