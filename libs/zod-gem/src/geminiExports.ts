/** THIS IS COPIED AS IS FROM `genai` npm package. */

/** Optional. The type of the data. */
export declare enum Type {
	TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED",
	STRING = "STRING",
	NUMBER = "NUMBER",
	INTEGER = "INTEGER",
	BOOLEAN = "BOOLEAN",
	ARRAY = "ARRAY",
	OBJECT = "OBJECT",
}

export declare interface Schema {
	/** Optional. Example of the object. Will only populated when the object is the root. */
	example?: unknown;
	/** Optional. Pattern of the Type.STRING to restrict a string to a regular expression. */
	pattern?: string;
	/** Optional. Default value of the data. */
	default?: unknown;
	/** Optional. Maximum length of the Type.STRING */
	maxLength?: string;
	/** Optional. SCHEMA FIELDS FOR TYPE STRING Minimum length of the Type.STRING */
	minLength?: string;
	/** Optional. Minimum number of the properties for Type.OBJECT. */
	minProperties?: string;
	/** Optional. Maximum number of the properties for Type.OBJECT. */
	maxProperties?: string;
	/** Optional. The value should be validated against any (one or more) of the subschemas in the list. */
	anyOf?: Schema[];
	/** Optional. The description of the data. */
	description?: string;
	/** Optional. Possible values of the element of primitive type with enum format. Examples: 1. We can define direction as : {type:STRING, format:enum, enum:["EAST", NORTH", "SOUTH", "WEST"]} 2. We can define apartment number as : {type:INTEGER, format:enum, enum:["101", "201", "301"]} */
	enum?: string[];
	/** Optional. The format of the data. Supported formats: for NUMBER type: "float", "double" for INTEGER type: "int32", "int64" for STRING type: "email", "byte", etc */
	format?: string;
	/** Optional. SCHEMA FIELDS FOR TYPE ARRAY Schema of the elements of Type.ARRAY. */
	items?: Schema;
	/** Optional. Maximum number of the elements for Type.ARRAY. */
	maxItems?: string;
	/** Optional. Maximum value of the Type.INTEGER and Type.NUMBER */
	maximum?: number;
	/** Optional. Minimum number of the elements for Type.ARRAY. */
	minItems?: string;
	/** Optional. SCHEMA FIELDS FOR TYPE INTEGER and NUMBER Minimum value of the Type.INTEGER and Type.NUMBER */
	minimum?: number;
	/** Optional. Indicates if the value may be null. */
	nullable?: boolean;
	/** Optional. SCHEMA FIELDS FOR TYPE OBJECT Properties of Type.OBJECT. */
	properties?: Record<string, Schema>;
	/** Optional. The order of the properties. Not a standard field in open api spec. Only used to support the order of the properties. */
	propertyOrdering?: string[];
	/** Optional. Required properties of Type.OBJECT. */
	required?: string[];
	/** Optional. The title of the Schema. */
	title?: string;
	/** Optional. The type of the data. */
	type?: Type;
}
