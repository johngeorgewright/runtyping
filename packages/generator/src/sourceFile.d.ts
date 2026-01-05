import { SourceFile } from 'ts-morph';
export type SourceCodeFile = SourceFile;
/**
 * Sometimes a typeName can be in the format of:
 * `import("/some/path").A`
 * When this occurs, decipher the source file's local
 * alias of the imported type.
 */
export declare function getLocalName(sourceFile: SourceCodeFile, typeName: string): string;
export declare function importTypeNameRegExp(typeName: string): {
    importPath: string;
    importTypeName: string;
    arguments: string;
} | null;
