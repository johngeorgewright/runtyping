import { array, lazy, literal, null as Null, number, object, output, record, string, undefined as Undefined, ZodType } from 'zod';
import { JSONSchema7 as _JSONSchema7, JSONSchema7Array as _JSONSchema7Array, JSONSchema7Definition as _JSONSchema7Definition, JSONSchema7Object as _JSONSchema7Object, JSONSchema7Type as _JSONSchema7Type } from 'json-schema/index';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const JSONSchema7Definition: ZodType<_JSONSchema7Definition> = lazy(() => literal(false).or(literal(true)).or(JSONSchema7));

export type JSONSchema7Definition = output<typeof JSONSchema7Definition>;

export const JSONSchema7TypeName = literal("string").or(literal("number")).or(literal("boolean")).or(literal("object")).or(literal("integer")).or(literal("array")).or(literal("null"));

export type JSONSchema7TypeName = output<typeof JSONSchema7TypeName>;

export const JSONSchema7Object: ZodType<_JSONSchema7Object> = lazy(() => record(string(), JSONSchema7Type));

export type JSONSchema7Object = output<typeof JSONSchema7Object>;

export const JSONSchema7Array: ZodType<_JSONSchema7Array> = lazy(() => array(JSONSchema7Type));

export type JSONSchema7Array = output<typeof JSONSchema7Array>;

export const JSONSchema7Type: ZodType<_JSONSchema7Type> = lazy(() => Null().or(string()).or(number()).or(literal(false)).or(literal(true)).or(JSONSchema7Object).or(JSONSchema7Array));

export type JSONSchema7Type = output<typeof JSONSchema7Type>;

export const JSONSchema7: ZodType<_JSONSchema7> = lazy(() => object({ $id: string().or(Undefined()).optional(), $ref: string().or(Undefined()).optional(), $schema: string().or(Undefined()).optional(), $comment: string().or(Undefined()).optional(), $defs: record(string(), JSONSchema7Definition).or(Undefined()).optional(), type: literal("string").or(literal("number")).or(literal("boolean")).or(literal("object")).or(literal("integer")).or(literal("array")).or(literal("null")).or(array(JSONSchema7TypeName)).or(Undefined()).optional(), enum: array(JSONSchema7Type).or(Undefined()).optional(), const: Null().or(string()).or(number()).or(literal(false)).or(literal(true)).or(JSONSchema7Object).or(JSONSchema7Array).or(Undefined()).optional(), multipleOf: number().or(Undefined()).optional(), maximum: number().or(Undefined()).optional(), exclusiveMaximum: number().or(Undefined()).optional(), minimum: number().or(Undefined()).optional(), exclusiveMinimum: number().or(Undefined()).optional(), maxLength: number().or(Undefined()).optional(), minLength: number().or(Undefined()).optional(), pattern: string().or(Undefined()).optional(), items: literal(false).or(literal(true)).or(JSONSchema7).or(array(JSONSchema7Definition)).or(Undefined()).optional(), additionalItems: literal(false).or(literal(true)).or(JSONSchema7).or(Undefined()).optional(), maxItems: number().or(Undefined()).optional(), minItems: number().or(Undefined()).optional(), uniqueItems: literal(false).or(literal(true)).or(Undefined()).optional(), contains: literal(false).or(literal(true)).or(JSONSchema7).or(Undefined()).optional(), maxProperties: number().or(Undefined()).optional(), minProperties: number().or(Undefined()).optional(), required: array(string()).or(Undefined()).optional(), properties: record(string(), JSONSchema7Definition).or(Undefined()).optional(), patternProperties: record(string(), JSONSchema7Definition).or(Undefined()).optional(), additionalProperties: literal(false).or(literal(true)).or(JSONSchema7).or(Undefined()).optional(), dependencies: record(string(), literal(false).or(literal(true)).or(JSONSchema7).or(array(string()))).or(Undefined()).optional(), propertyNames: literal(false).or(literal(true)).or(JSONSchema7).or(Undefined()).optional(), if: literal(false).or(literal(true)).or(JSONSchema7).or(Undefined()).optional(), then: literal(false).or(literal(true)).or(JSONSchema7).or(Undefined()).optional(), else: literal(false).or(literal(true)).or(JSONSchema7).or(Undefined()).optional(), allOf: array(JSONSchema7Definition).or(Undefined()).optional(), anyOf: array(JSONSchema7Definition).or(Undefined()).optional(), oneOf: array(JSONSchema7Definition).or(Undefined()).optional(), not: literal(false).or(literal(true)).or(JSONSchema7).or(Undefined()).optional(), format: string().or(Undefined()).optional(), contentMediaType: string().or(Undefined()).optional(), contentEncoding: string().or(Undefined()).optional(), definitions: record(string(), JSONSchema7Definition).or(Undefined()).optional(), title: string().or(Undefined()).optional(), description: string().or(Undefined()).optional(), default: Null().or(string()).or(number()).or(literal(false)).or(literal(true)).or(JSONSchema7Object).or(JSONSchema7Array).or(Undefined()).optional(), readOnly: literal(false).or(literal(true)).or(Undefined()).optional(), writeOnly: literal(false).or(literal(true)).or(Undefined()).optional(), examples: Null().or(string()).or(number()).or(literal(false)).or(literal(true)).or(JSONSchema7Object).or(JSONSchema7Array).or(Undefined()).optional(), }));

export type JSONSchema7 = output<typeof JSONSchema7>;

export const A = object({ foo: string(), schema: JSONSchema7, });

export type A = output<typeof A>;
