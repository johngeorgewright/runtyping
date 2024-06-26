import { array, literal, null as Null, number, partial, record, recursion, string, type, Type, TypeOf, undefined as Undefined, union } from 'io-ts';
import { JSONSchema7 as _JSONSchema7, JSONSchema7Array as _JSONSchema7Array, JSONSchema7Definition as _JSONSchema7Definition, JSONSchema7Object as _JSONSchema7Object, JSONSchema7Type as _JSONSchema7Type } from 'json-schema/index';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const JSONSchema7Definition: Type<_JSONSchema7Definition> = recursion('JSONSchema7Definition', () => union([literal(false), literal(true), JSONSchema7,]));

export type JSONSchema7Definition = TypeOf<typeof JSONSchema7Definition>;

export const JSONSchema7TypeName = union([literal("string"), literal("number"), literal("boolean"), literal("object"), literal("integer"), literal("array"), literal("null"),]);

export type JSONSchema7TypeName = TypeOf<typeof JSONSchema7TypeName>;

export const JSONSchema7Object: Type<_JSONSchema7Object> = recursion('JSONSchema7Object', () => record(string, JSONSchema7Type));

export type JSONSchema7Object = TypeOf<typeof JSONSchema7Object>;

export const JSONSchema7Array: Type<_JSONSchema7Array> = recursion('JSONSchema7Array', () => array(JSONSchema7Type));

export type JSONSchema7Array = TypeOf<typeof JSONSchema7Array>;

export const JSONSchema7Type: Type<_JSONSchema7Type> = recursion('JSONSchema7Type', () => union([Null, string, number, literal(false), literal(true), JSONSchema7Object, JSONSchema7Array,]));

export type JSONSchema7Type = TypeOf<typeof JSONSchema7Type>;

export const JSONSchema7: Type<_JSONSchema7> = recursion('JSONSchema7', () => partial({ $id: union([string, Undefined,]), $ref: union([string, Undefined,]), $schema: union([string, Undefined,]), $comment: union([string, Undefined,]), $defs: union([record(string, JSONSchema7Definition), Undefined,]), type: union([literal("string"), literal("number"), literal("boolean"), literal("object"), literal("integer"), literal("array"), literal("null"), array(JSONSchema7TypeName), Undefined,]), enum: union([array(JSONSchema7Type), Undefined,]), const: union([Null, string, number, literal(false), literal(true), JSONSchema7Object, JSONSchema7Array, Undefined,]), multipleOf: union([number, Undefined,]), maximum: union([number, Undefined,]), exclusiveMaximum: union([number, Undefined,]), minimum: union([number, Undefined,]), exclusiveMinimum: union([number, Undefined,]), maxLength: union([number, Undefined,]), minLength: union([number, Undefined,]), pattern: union([string, Undefined,]), items: union([literal(false), literal(true), JSONSchema7, array(JSONSchema7Definition), Undefined,]), additionalItems: union([literal(false), literal(true), JSONSchema7, Undefined,]), maxItems: union([number, Undefined,]), minItems: union([number, Undefined,]), uniqueItems: union([literal(false), literal(true), Undefined,]), contains: union([literal(false), literal(true), JSONSchema7, Undefined,]), maxProperties: union([number, Undefined,]), minProperties: union([number, Undefined,]), required: union([array(string), Undefined,]), properties: union([record(string, JSONSchema7Definition), Undefined,]), patternProperties: union([record(string, JSONSchema7Definition), Undefined,]), additionalProperties: union([literal(false), literal(true), JSONSchema7, Undefined,]), dependencies: union([record(string, union([literal(false), literal(true), JSONSchema7, array(string),])), Undefined,]), propertyNames: union([literal(false), literal(true), JSONSchema7, Undefined,]), if: union([literal(false), literal(true), JSONSchema7, Undefined,]), then: union([literal(false), literal(true), JSONSchema7, Undefined,]), else: union([literal(false), literal(true), JSONSchema7, Undefined,]), allOf: union([array(JSONSchema7Definition), Undefined,]), anyOf: union([array(JSONSchema7Definition), Undefined,]), oneOf: union([array(JSONSchema7Definition), Undefined,]), not: union([literal(false), literal(true), JSONSchema7, Undefined,]), format: union([string, Undefined,]), contentMediaType: union([string, Undefined,]), contentEncoding: union([string, Undefined,]), definitions: union([record(string, JSONSchema7Definition), Undefined,]), title: union([string, Undefined,]), description: union([string, Undefined,]), default: union([Null, string, number, literal(false), literal(true), JSONSchema7Object, JSONSchema7Array, Undefined,]), readOnly: union([literal(false), literal(true), Undefined,]), writeOnly: union([literal(false), literal(true), Undefined,]), examples: union([Null, string, number, literal(false), literal(true), JSONSchema7Object, JSONSchema7Array, Undefined,]), }));

export type JSONSchema7 = TypeOf<typeof JSONSchema7>;

export const A = type({ foo: string, schema: JSONSchema7, });

export type A = TypeOf<typeof A>;
