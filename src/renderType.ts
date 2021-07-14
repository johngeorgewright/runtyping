import { CodeBlockWriter, Type } from 'ts-morph'

export default function renderType(
  writer: CodeBlockWriter,
  type: Type,
  imports: Set<string>
): CodeBlockWriter {
  if (type.isArray()) {
    return renderType(
      writer.write('Array('),
      type.getArrayElementTypeOrThrow(),
      imports.add('Array')
    ).write(')')
  }

  if (type.isUnion()) {
    const [first, ...rest] = type
      .getUnionTypes()
      .sort(
        (a, b) =>
          Number(a.isUndefined()) - Number(b.isUndefined()) ||
          +(a > b) ||
          -(a < b)
      )

    if (!first) {
      imports.add('Undefined')
      return writer.write('Undefined')
    }

    return rest.reduce(
      (writer, restEl) =>
        renderType(writer.write('.Or('), restEl, imports).write(')'),
      renderType(writer, first, imports)
    )
  }

  if (type.isStringLiteral()) {
    imports.add('Literal')
    return writer.write(`Literal(${type.getText()})`)
  }

  if (type.isString()) {
    imports.add('String')
    return writer.write('String')
  }

  if (type.isNumber()) {
    imports.add('Number')
    return writer.write('Number')
  }

  if (type.isAny()) {
    imports.add('Unknown')
    return writer.write('Unknown')
  }

  if (type.isUndefined()) {
    imports.add('Undefined')
    return writer.write('Undefined')
  }

  if (type.isInterface() || type.isObject()) {
    return renderInterface(type, imports, writer)
  }

  throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
}

function renderInterface(
  type: Type,
  imports: Set<string>,
  writer: CodeBlockWriter
) {
  const isBuiltInType = type
    .getSymbolOrThrow()
    .getDeclarations()
    .some((d) =>
      d.getSourceFile().getFilePath().includes(require.resolve('typescript'))
    )

  if (isBuiltInType) {
    imports.add('InstanceOf')
    return writer.write(`InstanceOf(${type.getText()})`)
  }

  if (type.getStringIndexType()) {
    return renderType(
      writer.write('Dictionary('),
      type.getStringIndexType()!,
      imports.add('Dictionary').add('String')
    ).write(')')
  }

  return type
    .getProperties()
    .reduce(
      (writer, property) =>
        renderType(
          writer.write(`${property.getName()}:`),
          property.getValueDeclarationOrThrow().getType(),
          imports.add('Record')
        ).write(','),
      writer.write('Record({')
    )
    .write('})')
}
