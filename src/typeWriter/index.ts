import {
  EnumDeclaration,
  InterfaceDeclaration,
  Project,
  SourceFile,
  SyntaxKind,
  TypeAliasDeclaration,
  VariableDeclarationKind,
} from 'ts-morph'
import { Declare, Import, ImportFromSource, Write } from './symbols'
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
    type: `Static<typeof ${sourceType}>`,
  })

  exports.add(sourceType)
}

function getTypeDeclaration(sourceFile: SourceFile, sourceType: string) {
  try {
    return sourceFile.getInterfaceOrThrow(sourceType)
  } catch (error) {}

  try {
    return sourceFile.getTypeAliasOrThrow(sourceType)
  } catch (error) {}

  try {
    return sourceFile.getEnumOrThrow(sourceType)
  } catch (error) {
    throw new Error(
      `Cannot find any interface, type or enum called "${sourceType}" in ${sourceFile.getFilePath()}.`
    )
  }
}

function hasTypeDeclaration(sourceFile: SourceFile, sourceType: string) {
  try {
    return !!getTypeDeclaration(sourceFile, sourceType)
  } catch (error) {
    return false
  }
}

function isRecursive(
  typeDeclaration: InterfaceDeclaration | TypeAliasDeclaration | EnumDeclaration
) {
  const name = typeDeclaration.getName()

  for (const node of typeDeclaration.getDescendantsOfKind(
    SyntaxKind.TypeReference
  )) {
    if (node.getText() === name) return true
  }

  return false
}
