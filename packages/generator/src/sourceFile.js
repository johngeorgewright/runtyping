import { SyntaxKind } from 'ts-morph';
/**
 * Sometimes a typeName can be in the format of:
 * `import("/some/path").A`
 * When this occurs, decipher the source file's local
 * alias of the imported type.
 */
export function getLocalName(sourceFile, typeName) {
    const match = importTypeNameRegExp(typeName);
    if (!match)
        return typeName;
    for (const importDeclaration of sourceFile.getImportDeclarations()) {
        if (match.importTypeName === 'default')
            return importDeclaration.getDefaultImportOrThrow().getText();
        else {
            for (const importSpecifier of importDeclaration
                .getImportClause()
                ?.getNamedImports() || []) {
                let [remoteIdentifier, localIdentifier] = importSpecifier
                    .getDescendantsOfKind(SyntaxKind.Identifier)
                    .map((indentifier) => indentifier.getText());
                localIdentifier = localIdentifier || remoteIdentifier;
                if (remoteIdentifier === match.importTypeName)
                    return localIdentifier;
            }
        }
    }
    return match.importTypeName;
}
export function importTypeNameRegExp(typeName) {
    const match = /^import\("([\/\\\w\.@-]+)"\)\.(\w+)(<[^>]+>)?$/.exec(typeName);
    return (match && {
        importPath: /\.(m|j)?ts$/.test(match[1]) ? match[1] : `${match[1]}`,
        importTypeName: match[2],
        arguments: match[3],
    });
}
//# sourceMappingURL=sourceFile.js.map