import { ResolutionHostFactory } from 'ts-morph'
import ts from 'typescript'

const resolutionHostFactory: ResolutionHostFactory = (
  moduleResolutionHost,
  getCompilerOptions
) => {
  const moduleResolutionCache = ts.createModuleResolutionCache(
    process.cwd(),
    (x) => x,
    getCompilerOptions()
  )
  const typeReferenceDirectiveCache =
    ts.createTypeReferenceDirectiveResolutionCache(
      process.cwd(),
      (x) => x,
      getCompilerOptions()
    )
  return {
    resolveModuleNames: (moduleNames, containingFile) =>
      moduleNames.reduce<ts.ResolvedModuleFull[]>((resolvedModules, name) => {
        const { resolvedModule } = ts.resolveModuleName(
          name,
          containingFile,
          getCompilerOptions(),
          moduleResolutionHost
        )
        if (resolvedModule) resolvedModules.push(resolvedModule)
        return resolvedModules
      }, []),
    getResolvedModuleWithFailedLookupLocationsFromCache: (
      moduleName,
      containingFile,
      resolutionMode
    ) =>
      ts.resolveModuleNameFromCache(
        moduleName,
        containingFile,
        moduleResolutionCache,
        resolutionMode
      ),
    resolveTypeReferenceDirectives: (
      typeDirectiveNames,
      containingFile,
      redirectedReference,
      options,
      containingFileMode
    ) => {
      const resolved: ts.ResolvedTypeReferenceDirective[] = []
      for (const name of typeDirectiveNames) {
        const { resolvedTypeReferenceDirective } =
          ts.resolveTypeReferenceDirective(
            typeof name === 'string' ? name : name.fileName,
            containingFile,
            options,
            moduleResolutionHost,
            redirectedReference,
            typeReferenceDirectiveCache,
            containingFileMode
          )
        if (resolvedTypeReferenceDirective)
          resolved.push(resolvedTypeReferenceDirective)
      }
      return resolved
    },
  }
}

export default resolutionHostFactory
