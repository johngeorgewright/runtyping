import {
  DeclareType,
  Enum,
  escapeQuottedPropName,
  getGenerics,
  getTypeName,
  Import,
  ImportFromSource,
  propNameRequiresQuotes,
  sortUndefinedFirst,
  Static,
  Tuple,
  TypeWriter,
  TypeWriters,
  Write,
} from '@runtyping/generator'
import { titleCase } from 'title-case'
import { SymbolFlags, ts, Type } from 'ts-morph'
import * as zod from 'zod'

export default class ZodTypeWriters extends TypeWriters {
  #module = 'zod';

  override *defaultStaticImplementation(): TypeWriter {
    yield [Import, { source: this.#module, alias: 'Infer', name: 'infer' }]
    yield [Static, 'Infer<typeof ${name}>']
  }

  override any() {
    return this.#simple('any')
  }

  override *array(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'array' }]
    yield [Write, 'array(']
    yield* this.generateOrReuseType(type.getArrayElementTypeOrThrow())
    yield [Write, ')']
  }

  override boolean() {
    return this.#simple('boolean')
  }

  override *builtInObject(type: Type): TypeWriter {
    yield [
      Import,
      { source: this.#module, name: 'instanceof', alias: 'InstanceOf' },
    ]
    yield [Write, `InstanceOf(${type.getText()})`]
  }

  override *enum(type: Type): TypeWriter {
    const name = getTypeName(type)
    yield [Import, { source: this.#module, name: 'nativeEnum' }]
    yield [ImportFromSource, { name, alias: `_${name}` }]
    yield [Write, `nativeEnum(_${name})`]
  }

  override *enumLiteral(type: Type): TypeWriter {
    const enumTypeName = Enum.getEnumIdentifierNameFromEnumLiteral(type)
    yield [ImportFromSource, { name: enumTypeName, alias: `_${enumTypeName}` }]
    yield* this.#literal(`_${enumTypeName}.${getTypeName(type)}`)
  }

  override *function(): TypeWriter {
    yield [Import, { source: this.#module, alias: 'func', name: 'function' }]
    yield [Write, 'func()']
  }

  override *intersection(type: Type): TypeWriter {
    const [first, ...rest] = type
      .getIntersectionTypes()
      .sort(sortUndefinedFirst)

    if (!first) return yield* this.#simple('undefined')

    yield* this.generateOrReuseType(first)
    for (const item of rest) {
      yield [Write, '.and(']
      yield* this.generateOrReuseType(item)
      yield [Write, ')']
    }
  }

  override *lazy(type: Type): TypeWriter {
    const name = getTypeName(type)
    const alias = `_${name}`
    yield [Import, { source: this.#module, name: 'lazy' }]
    yield [Import, { source: this.#module, name: 'ZodType' }]
    yield [ImportFromSource, { alias, name }]
    yield [DeclareType, `ZodType<${alias}>`]
    yield [Write, 'lazy(() => ']
    yield* this.typeWriter(type)
    yield [Write, ')']
  }

  override literal(type: Type): TypeWriter {
    return this.#literal(type.getText())
  }

  *#literal(value: string): TypeWriter {
    yield [Import, { source: this.#module, name: 'literal' }]
    yield [Write, `literal(${value})`]
  }

  override null() {
    return this.#simple('null')
  }

  override number() {
    return this.#simple('number')
  }

  override *numberIndexedObject(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'record' }]
    yield [Import, { source: this.#module, name: 'number' }]
    yield [Write, 'record(number(), ']
    yield* this.generateOrReuseType(type.getNumberIndexType()!)
    yield [Write, ')']
  }

  override *object(type: Type<ts.ObjectType>): TypeWriter {
    yield [Import, { source: this.#module, name: 'object' }]
    yield [Write, 'object({']

    const typeArguments = getGenerics(type).map((typeArgument) =>
      typeArgument.getText()
    )

    for (const property of type.getProperties()) {
      yield [
        Write,
        `${
          propNameRequiresQuotes(property.getName())
            ? `[\`${escapeQuottedPropName(property.getName())}\`]`
            : property.getName()
        }:`,
      ]
      const propertyType = property.getValueDeclarationOrThrow().getType()
      if (!typeArguments.includes(propertyType.getText()))
        yield* this.generateOrReuseType(propertyType)
      else yield [Write, propertyType.getText()]
      if (property.hasFlags(SymbolFlags.Optional)) yield [Write, '.optional()']
      yield [Write, ',']
    }

    yield [Write, '})']
  }

  override *genericObject(type: Type<ts.ObjectType>): TypeWriter {
    yield [Import, { source: this.#module, alias: 'Infer', name: 'infer' }]
    yield [Import, { source: this.#module, name: 'ZodType' }]
    yield* this.objectFunction(type, 'ZodType', 'Infer')
  }

  override string() {
    return this.#simple('string')
  }

  override *stringIndexedObject(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'record' }]
    yield [Import, { source: this.#module, name: 'string' }]
    yield [Write, 'record(string(), ']
    yield* this.generateOrReuseType(type.getStringIndexType()!)
    yield [Write, ')']
  }

  override *tuple(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'tuple' }]
    yield [Write, 'tuple([']
    for (const element of type.getTupleElements()) {
      yield* this.generateOrReuseType(element)
      yield [Write, ',']
    }
    yield [Write, '])']
  }

  override undefined() {
    return this.#simple('undefined')
  }

  override *union(type: Type): TypeWriter {
    const [first, ...rest] = type.getUnionTypes().sort(sortUndefinedFirst)

    if (!first) return yield* this.#simple('undefined')

    yield* this.generateOrReuseType(first)

    for (const item of rest) {
      yield [Write, '.or(']
      yield* this.generateOrReuseType(item)
      yield [Write, ')']
    }
  }

  override unknown() {
    return this.#simple('unknown')
  }

  override *variadicTuple(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'array' }]

    try {
      const name = getTypeName(type)
      const alias = `_${name}`
      yield [ImportFromSource, { alias, name }]
      yield [Static, alias]
    } catch (error) {
      yield [Static, type.getText()]
    }

    yield [Write, 'array(']
    yield* this.#simple('any')
    yield [
      Write,
      `)
        .min(${Tuple.getTupleMinSize(type)})
        .superRefine((data, ctx) => {`,
    ]
    yield* this.#variadicTupleElements(Tuple.getTupleElements(type))
    yield [
      Write,
      `
        })`,
    ]
  }

  *#variadicTupleElements(types: Tuple.TupleElement[]): TypeWriter {
    let variadicIndex
    for (let i = 0; i < types.length; i++) {
      const { element, variadic } = types[i]
      if (variadic) {
        variadicIndex = i
        yield* this.#variadicTupleVariadicElement(
          element,
          i,
          i === types.length - 1 ? undefined : i - (types.length - 1)
        )
      } else
        yield* this.#variadicTupleElement(
          element,
          variadicIndex === undefined ? i : i - types.length
        )
    }
  }

  *#variadicTupleElement(type: Type, index: number): TypeWriter {
    yield [Import, { source: '@runtyping/zod', name: 'validators' }]
    yield [
      Write,
      `validators.pipeIssues({
        ctx,
        data: ${index >= 0 ? `data[${index}]` : `data.slice(${index})[0]`},
        path: ${index},
        type: `,
    ]
    yield* this.generateOrReuseType(type)
    yield [
      Write,
      `
    });
    `,
    ]
  }

  *#variadicTupleVariadicElement(
    type: Type,
    from: number,
    to?: number
  ): TypeWriter {
    yield [Import, { source: '@runtyping/zod', name: 'validators' }]
    yield [Import, { source: this.#module, name: 'array' }]
    yield [
      Write,
      `validators.pipeIssues({
        ctx,
        data: data.slice(${from}, ${to}),
        path: ${from},
        type: array(`,
    ]
    yield* this.generateOrReuseType(type)
    yield [
      Write,
      `)
    })
    `,
    ]
  }

  override void() {
    return this.#simple('void')
  }

  *#simple(type: keyof typeof zod): TypeWriter {
    if (primitiveNames.includes(type)) {
      const alias = titleCase(type)
      yield [Import, { source: this.#module, name: type, alias }]
      yield [Write, `${alias}()`]
    } else {
      yield [Import, { source: this.#module, name: type }]
      yield [Write, `${type}()`]
    }
  }
}

const primitiveNames = ['any', 'never', 'null', 'undefined', 'unknown', 'void']
