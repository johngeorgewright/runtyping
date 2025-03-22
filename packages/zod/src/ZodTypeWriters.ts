import {
  CanDeclareStatics,
  DeclareType,
  Enum,
  getTypeName,
  Import,
  ImportFromSource,
  sortUndefinedFirst,
  Static,
  Tuple,
  TypeWriter,
  TypeWriters,
  Write,
} from '@runtyping/generator'
import { getFunctionName } from '@runtyping/generator/dist/function'
import { titleCase } from 'title-case'
import { Signature, ts, Type } from 'ts-morph'
import * as zod from 'zod'

export default class ZodTypeWriters extends TypeWriters {
  #module = 'zod';

  override *defaultStaticImplementation(type: Type): TypeWriter {
    yield [Import, { source: this.#module, name: 'output' }]
    yield [Static, [type, 'output<typeof ${name}>']]
  }

  override any() {
    return this.#simple('any')
  }

  override array(_type: Type, elementType: Type): TypeWriter {
    return this.#array(this.generateOrReuseType(elementType))
  }

  *#array(element: TypeWriter): TypeWriter {
    yield [Import, { source: this.#module, name: 'array' }]
    yield [Write, 'array(']
    yield* element
    yield [Write, ')']
  }

  override *attachTransformer(
    typeWriter: TypeWriter,
    fileName: string,
    exportName: string
  ): TypeWriter {
    yield* typeWriter
    const alias = `${exportName}Transformer`
    yield [Import, { source: fileName, name: exportName, alias }]
    yield [Write, `.transform(${alias})`]
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

  override *function(type: Type): TypeWriter {
    yield [Import, { source: this.#module, alias: 'func', name: 'function' }]
    const name = getFunctionName(type)
    if (name && (yield [CanDeclareStatics, type])) {
      const alias = `_${name}`
      yield [ImportFromSource, { alias, name }]
      yield [Write, 'func()']
      yield [
        Static,
        [
          type,
          type.isInterface() || type.getAliasSymbol()
            ? alias
            : `typeof ${alias}`,
        ],
      ]
    } else {
      const [firstCallSignature, ...otherCallSignatures] =
        type.getCallSignatures()
      yield* this.#callSignature(firstCallSignature)
      for (const callSignature of otherCallSignatures) {
        yield [Write, '.or(']
        yield* this.#callSignature(callSignature)
        yield [Write, ')']
      }
    }
  }

  *#callSignature(callSignature: Signature): TypeWriter {
    yield [Write, 'func().args(']
    for (const parameter of callSignature.getParameters()) {
      yield* this.generateOrReuseType(
        parameter.getValueDeclaration()?.getType() ||
          parameter.getDeclaredType()
      )
      yield [Write, ', ']
    }
    yield [Write, ').returns(']
    yield* this.generateOrReuseType(callSignature.getReturnType())
    yield [Write, ')']
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

  override never() {
    return this.#simple('never')
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
    yield* this.objectProperties(type, {
      *whenOptional(propertyWriter) {
        yield* propertyWriter
        yield [Write, '.optional()']
      },
    })
    yield [Write, '})']
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
    if (yield [CanDeclareStatics, type])
      yield [Static, [type, yield* this.getStaticReference(type)]]
    yield* this.#array(this.#simple('any'))
    yield [
      Write,
      `
        .min(${Tuple.getTupleMinSize(type)})
        .superRefine((data, ctx) => {`,
    ]

    yield* this.variadicTupleElements({
      tupleType: type,
      *element(type, index) {
        yield [Import, { source: '@runtyping/zod', name: 'validators' }]
        yield [
          Write,
          `validators.pipeIssues({
            ctx,
            data: ${
              index >= 0 ? `data[${index}]` : `data[data.length${index}]`
            },
            path: ${index >= 0 ? index : `data.length${index}`},
            type: `,
        ]
        yield* this.generateOrReuseType(type)
        yield [
          Write,
          `
          });`,
        ]
      },
      *variadicElement(this: ZodTypeWriters, type, from, to) {
        yield [Import, { source: '@runtyping/zod', name: 'validators' }]
        yield [
          Write,
          `validators.pipeIssues({
            ctx,
            data: data.slice(${from}, ${to}),
            path: \`${from}-\${${from} + data.slice(${from}, ${to}).length}\`,
            type: `,
        ]
        yield* this.#array(this.generateOrReuseType(type))
        yield [
          Write,
          `
          });`,
        ]
      },
      *separator() {
        yield [Write, '\n']
      },
    })

    yield [
      Write,
      `
        })`,
    ]
  }

  override void() {
    return this.#simple('void')
  }

  override *withGenerics(
    typeWriter: TypeWriter,
    type: Type<ts.Type>
  ): TypeWriter {
    yield [Import, { source: this.#module, name: 'output' }]
    yield [Import, { source: this.#module, name: 'ZodType' }]
    const close = yield* this.openGenericFunction(type, 'ZodType', 'output')
    yield* typeWriter
    yield* close()
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
