import type {
	ZodTypeAny,
	ZodRawShape,
	ZodArray,
	ZodNumber,
	ZodObject,
	ZodString,
} from "zod";

import { type Schema, Type } from "./geminiExports";
import { unwrapZodType } from "./helper";

/**
 * Handles ZodString type mapping
 */
export function mapZodStringToGemini(
	stringType: ZodString,
	baseSchema: Schema,
): Schema {
	const schema: Schema = {
		...baseSchema,
		type: Type.STRING,
	};

	// Add string-specific constraints
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

/**
 * Handles ZodNumber type mapping
 */
export function mapZodNumberToGemini(
	numberType: ZodNumber,
	baseSchema: Schema,
): Schema {
	const schema: Schema = {
		...baseSchema,
		type: Type.NUMBER,
	};

	// Add number-specific constraints
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

/**
 * Handles ZodArray type mapping
 */
export function mapZodArrayToGemini(
	arrayType: ZodArray<ZodTypeAny>,
	baseSchema: Schema,
	fieldName: string,
	mapFn: (type: ZodTypeAny, name: string, desc: string) => Schema,
): Schema {
	const schema: Schema = {
		...baseSchema,
		type: Type.ARRAY,
		items: mapFn(
			arrayType.element,
			`${fieldName}Element`,
			"Element of the array",
		),
	};

	// Add array-specific constraints
	if (arrayType._def.minLength !== null) {
		schema.minItems = String(arrayType._def.minLength);
	}
	if (arrayType._def.maxLength !== null) {
		schema.maxItems = String(arrayType._def.maxLength);
	}

	return schema;
}

/**
 * Handles ZodObject type mapping
 */
export function mapZodObjectToGemini(
	objectType: ZodObject<ZodRawShape>,
	baseSchema: Schema,
	mapFn: (type: ZodTypeAny, name: string, desc: string) => Schema,
): Schema {
	const shape = objectType.shape;
	const properties: Record<string, Schema> = {};
	const required: string[] = [];
	const propertyOrdering: string[] = [];

	// Process each property in the object
	for (const [key, value] of Object.entries(shape)) {
		// Get description from property metadata if available
		const propDescription = value._def.description || `Property ${key}`;

		// Map the property type to Gemini schema
		const propSchema = mapFn(value, key, propDescription);
		properties[key] = propSchema;

		// Track property ordering
		propertyOrdering.push(key);

		// Add to required list if not optional
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
