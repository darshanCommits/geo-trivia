import {
	type ZodType,
	ZodArray,
	ZodBoolean,
	ZodEnum,
	ZodNumber,
	ZodObject,
	ZodString,
	ZodUnion,
} from "zod";

import { type Schema, Type } from "./geminiExports";
import { createBaseSchema, unwrapZodType } from "./helper";
import * as mapper from "./mappers";

/**
 * Maps a Zod type to its corresponding Gemini schema
 * @param zodType The Zod type to map
 * @param fieldName Name of the field (for better descriptions)
 * @param fieldDescription Description for the field
 * @returns A Gemini compatible schema
 */
export default function toZodGem<T>(
	zodType: ZodType<T>,
	fieldName = "",
	fieldDescription = "",
): Schema {
	// Unwrap any optional/nullable wrappers to get to the core type
	const { innerType, isNullable } = unwrapZodType(zodType);

	// Create base schema with common properties
	const baseSchema = createBaseSchema(isNullable, fieldName, fieldDescription);

	// Handle union types (creates anyOf schema)
	if (innerType instanceof ZodUnion) {
		return {
			...baseSchema,
			anyOf: innerType._def.options.map((option: ZodType<T>) =>
				toZodGem(option, fieldName, fieldDescription),
			),
		};
	}

	// String type
	if (innerType instanceof ZodString) {
		return mapper.mapZodStringToGemini(innerType, baseSchema);
	}

	// Number type
	if (innerType instanceof ZodNumber) {
		return mapper.mapZodNumberToGemini(innerType, baseSchema);
	}

	// Boolean type
	if (innerType instanceof ZodBoolean) {
		return {
			...baseSchema,
			type: Type.BOOLEAN,
		};
	}

	// Enum type
	if (innerType instanceof ZodEnum) {
		return {
			...baseSchema,
			type: Type.STRING,
			enum: innerType._def.values,
			format: "enum",
		};
	}

	// Array type
	if (innerType instanceof ZodArray) {
		return mapper.mapZodArrayToGemini(
			innerType,
			baseSchema,
			fieldName,
			toZodGem,
		);
	}

	// Object type
	if (innerType instanceof ZodObject) {
		return mapper.mapZodObjectToGemini(innerType, baseSchema, toZodGem);
	}

	// Fallback for unsupported types
	return {
		...baseSchema,
		type: Type.STRING,
		description: `Unsupported Zod type: ${innerType.constructor.name}`,
	};
}
