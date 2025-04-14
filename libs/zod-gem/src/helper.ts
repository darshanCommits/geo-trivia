import type { Schema } from "./geminiExports";
import {
	ZodDefault,
	ZodEffects,
	ZodNullable,
	ZodOptional,
	type ZodType,
} from "zod";

type ZodUnwrapped = {
	innerType: ZodType<unknown>;
	isNullable: boolean;
};

/**
 * Extracts the underlying Zod type and nullability information
 * @param zodType The Zod type to unwrap
 * @returns The unwrapped Zod type and whether it's nullable
 */
export function unwrapZodType<T>(zodType: ZodType<T>): ZodUnwrapped {
	let currentType: ZodType<unknown> = zodType;
	let isNullable = zodType instanceof ZodNullable;

	// Unwrap layers of ZodOptional, ZodNullable, ZodEffects, and ZodDefault
	while (
		currentType instanceof ZodOptional ||
		currentType instanceof ZodNullable ||
		currentType instanceof ZodEffects ||
		currentType instanceof ZodDefault
	) {
		if (currentType instanceof ZodOptional) {
			isNullable = true;
			currentType = currentType._def.innerType;
		} else if (currentType instanceof ZodNullable) {
			isNullable = true;
			currentType = currentType._def.innerType;
		} else if (currentType instanceof ZodDefault) {
			currentType = currentType._def.innerType;
		} else if (currentType instanceof ZodEffects) {
			currentType = currentType._def.schema;
		}
	}

	return {
		innerType: currentType,
		isNullable,
	};
}

/**
 * Creates a base schema with common properties
 */
export function createBaseSchema(
	isNullable: boolean,
	fieldName: string,
	fieldDescription: string,
): Schema {
	return {
		description: fieldDescription || `Field ${fieldName}`,
		nullable: isNullable,
	};
}
