import {
  EnumDeclaration,
  FunctionDeclaration,
  InterfaceDeclaration,
  Project,
  SourceFile,
  SyntaxKind,
  TypeAliasDeclaration,
  VariableDeclarationKind,
} from 'ts-morph'
import { Declare, Import, ImportFromSource, Static, Write } from './symbols'
import factory from './factory'

export default function writeRuntype(
  project: Project,
  sourceFile: SourceFile,
  sourceType: string,
  targetFile: SourceFile,
  runtypeImports: Set<string>,
  sourceImports: Set<string>,
  exports: Set<string>
) {
  const typeDeclaration = getTypeDeclaration(sourceFile, sourceType)
  const recursive = isRecursive(typeDeclaration)
  const generator = factory(typeDeclaration.getType())
  let staticImplementation = `Static<typeof ${sourceType}>`

  let writer = project.createWriter()

  if (recursive) {
    runtypeImports.add('Lazy')
    writer = writer.write('Lazy(() => ')
  }

  let item = generator.next()

  while (!item.done) {
    let next: true | undefined

    switch (item.value[0]) {
      case Write:
        writer = writer.write(item.value[1])
        break

      case Import:
        runtypeImports.add(item.value[1])
        break

      case ImportFromSource:
        sourceImports.add(item.value[1])
        break

      case Declare:
        if (recursive || hasTypeDeclaration(sourceFile, item.value[1])) {
          next = true
          writer = writer.write(item.value[1])
        }
        if (next && !recursive && !exports.has(item.value[1]))
          writeRuntype(
            project,
            sourceFile,
            item.value[1],
            targetFile,
            runtypeImports,
            sourceImports,
            exports
          )
        break

      case Static:
        staticImplementation = item.value[1]
        break
    }

    item = generator.next(next)
  }

  if (recursive) {
    writer = writer.write(')')
  }

  targetFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: sourceType,
        initializer: writer.toString(),
      },
    ],
  })

  runtypeImports.add('Static')

  targetFile.addTypeAlias({
    isExported: true,
    name: sourceType,
    type: staticImplementation,
  })

  exports.add(sourceType)
}

function getTypeDeclaration(sourceFile: SourceFile, typeName: string) {
  const declaration =
    sourceFile.getInterface(typeName) ||
    sourceFile.getTypeAlias(typeName) ||
    sourceFile.getEnum(typeName) ||
    sourceFile.getFunction(typeName)

  if (!declaration)
    throw new Error(
      `Cannot find any interface, type or enum called "${typeName}" in ${sourceFile.getFilePath()}.`
    )

  return declaration
}

function hasTypeDeclaration(sourceFile: SourceFile, typeName: string) {
  try {
    return !!getTypeDeclaration(sourceFile, typeName)
  } catch (error) {
    return false
  }
}

function isRecursive(
  typeDeclaration:
    | InterfaceDeclaration
    | TypeAliasDeclaration
    | EnumDeclaration
    | FunctionDeclaration
) {
  const name = typeDeclaration.getName()

  for (const node of typeDeclaration.getDescendantsOfKind(
    SyntaxKind.TypeReference
  )) {
    if (node.getText() === name) return true
  }

  return false
}
