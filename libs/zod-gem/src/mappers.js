import { Type } from "./geminiExports";
import { unwrapZodType } from "./helper";
export function mapZodStringToGemini(stringType, baseSchema) {
    const schema = {
        ...baseSchema,
        type: Type.STRING,
    };
    for (const check of stringType._def.checks || []) {
        switch (check.kind) {
            case "min":
                schema.minLength = String(check.value);
                break;
            case "max":
                schema.maxLength = String(check.value);
                break;
            case "regex":
                schema.pattern = check.regex.source;
                break;
            case "email":
                schema.format = "email";
                break;
            case "url":
                schema.format = "uri";
                break;
        }
    }
    return schema;
}
export function mapZodNumberToGemini(numberType, baseSchema) {
    const schema = {
        ...baseSchema,
        type: Type.NUMBER,
    };
    for (const check of numberType._def.checks || []) {
        switch (check.kind) {
            case "min":
                schema.minimum = check.value;
                break;
            case "max":
                schema.maximum = check.value;
                break;
            case "int":
                schema.format = "int64";
                break;
        }
    }
    return schema;
}
export function mapZodArrayToGemini(arrayType, baseSchema, fieldName, mapFn) {
    const schema = {
        ...baseSchema,
        type: Type.ARRAY,
        items: mapFn(arrayType.element, `${fieldName}Element`, "Element of the array"),
    };
    if (arrayType._def.minLength !== null) {
        schema.minItems = String(arrayType._def.minLength);
    }
    if (arrayType._def.maxLength !== null) {
        schema.maxItems = String(arrayType._def.maxLength);
    }
    return schema;
}
export function mapZodObjectToGemini(objectType, baseSchema, mapFn) {
    const shape = objectType.shape;
    const properties = {};
    const required = [];
    const propertyOrdering = [];
    for (const [key, value] of Object.entries(shape)) {
        const propDescription = value._def.description || `Property ${key}`;
        const propSchema = mapFn(value, key, propDescription);
        properties[key] = propSchema;
        propertyOrdering.push(key);
        const { isNullable } = unwrapZodType(value);
        if (!isNullable) {
            required.push(key);
        }
    }
    return {
        ...baseSchema,
        type: Type.OBJECT,
        properties,
        required: required.length > 0 ? required : undefined,
        propertyOrdering,
    };
}
//# sourceMappingURL=mappers.js.map