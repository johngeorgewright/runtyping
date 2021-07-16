import { Project, SyntaxKind } from 'ts-morph'

const project = new Project({
  skipAddingFilesFromTsConfig: true,
})

const sourceFile = project.addSourceFileAtPath('test/recursive.ts')

const iface = sourceFile.getInterfaceOrThrow('A')
console.info('iface name =', iface.getName())

for (const node of iface.getDescendantsOfKind(SyntaxKind.TypeReference)) {
  console.info(node.getText())
}
