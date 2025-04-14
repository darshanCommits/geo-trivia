export declare enum Type {
    TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED",
    STRING = "STRING",
    NUMBER = "NUMBER",
    INTEGER = "INTEGER",
    BOOLEAN = "BOOLEAN",
    ARRAY = "ARRAY",
    OBJECT = "OBJECT"
}
export declare interface Schema {
    example?: unknown;
    pattern?: string;
    default?: unknown;
    maxLength?: string;
    minLength?: string;
    minProperties?: string;
    maxProperties?: string;
    anyOf?: Schema[];
    description?: string;
    enum?: string[];
    format?: string;
    items?: Schema;
    maxItems?: string;
    maximum?: number;
    minItems?: string;
    minimum?: number;
    nullable?: boolean;
    properties?: Record<string, Schema>;
    propertyOrdering?: string[];
    required?: string[];
    title?: string;
    type?: Type;
}
