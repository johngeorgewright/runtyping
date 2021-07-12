import { Type } from 'ts-morph'

export default function renderType(
  type: Type,
  indent: number,
  imports: Set<string>
): string {
  if (type.isArray()) {
    imports.add('Array')
    return `Array(\n${renderIndent(indent + 1)}${renderType(
      type.getArrayElementTypeOrThrow(),
      indent + 1,
      imports
    )}\n${renderIndent(indent)})`
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
      return 'Undefined'
    }

    return rest.reduce(
      (rendered, restEl) =>
        `${rendered}.Or(${renderType(restEl, indent, imports)})`,
      renderType(first, indent, imports)
    )
  }

  if (type.isStringLiteral()) {
    imports.add('Literal')
    return `Literal(${type.getText()})`
  }

  if (type.isString()) {
    imports.add('String')
    return 'String'
  }

  if (type.isNumber()) {
    imports.add('Number')
    return 'Number'
  }

  if (type.isAny()) {
    imports.add('Unknown')
    return 'Unknown'
  }

  if (type.isUndefined()) {
    imports.add('Undefined')
    return 'Undefined'
  }

  if (type.isInterface() || type.isObject()) {
    return renderInterface(type, indent, imports)
  }

  throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
}

function renderInterface(type: Type, indent: number, imports: Set<string>) {
  const isBuiltInType = type
    .getSymbolOrThrow()
    .getDeclarations()
    .some((d) =>
      d.getSourceFile().getFilePath().includes(require.resolve('typescript'))
    )

  if (isBuiltInType) {
    imports.add('InstanceOf')
    return 'InstanceOf(' + type.getText() + ')'
  }

  if (type.getStringIndexType()) {
    imports.add('Dictionary')
    imports.add('String')
    return `Dictionary(${renderType(
      type.getStringIndexType()!,
      indent,
      imports
    )}, String)`
  }

  imports.add('Record')
  return `${type
    .getProperties()
    .reduce(
      (rendered, property) =>
        `${rendered}\n${renderIndent(
          indent + 1
        )}${property.getName()}: ${renderType(
          property.getValueDeclarationOrThrow().getType(),
          indent + 1,
          imports
        )},`,
      'Record({'
    )}\n${renderIndent(indent)}})`
}

function renderIndent(size: number) {
  return '  '.repeat(size)
}
