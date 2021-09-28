# runtyping

Generate [runtypes](https://github.com/pelotom/runtypes) from static types & JSON schema.

## Instructions

### Install

```
npm install runtypes
npm install -D runtyping
```

### Use from the command line

1. Create a file, in the root of your project, called "runtyping.yml".

   ```yaml
   # runtyping.yml

   targetFile: src/other-runtypes.ts # The file to create
   runtypeFormat: {type}Rt # Optional: use a custom name format for the created runtype
   typeFormat: {type}Type  # Optional: use a custom name format for the created type
   sourceTypes:
     file: src/types.ts # The file where your type lives
     type: Foo # The type you want to convert to a runtype
   ```

   You can also specify a list of target files, if you want to create more than one:

   ```yaml
   # runtyping.yml

   - targetFile: src/other-runtypes.ts
     sourceTypes:
       file: src/types.ts
       type: Foo

   - targetFile: src/runtypes.ts
     sourceTypes:
       # Source types can also be a list
       - file: src/types.ts
         type: Foo

       - file: json/my-json-schema.json # You can even use JSON schema files!!
         type: [ExampleType, AnotherExampleType] # You may use an array of types
   ```

1. Then run: `npx runtyping`

### Use from a script

Basic example:

```ts
import { Generator } from 'runtyping'

const generator = new Generator({
  targetFile: 'src/runtypes.ts',
  // optional: runtypeFormat / typeFormat (see above)
})

generator
  .generate([
    { file: 'src/types.ts', type: 'Foo' },
    { file: 'json/my-json-schema.json', type: 'ExampleType' },
  ])
  .then((file) => file.save())
```

#### Passing a custom tsconfig file

```ts
const generator = new Generator({
  targetFile: 'src/runtypes.ts',
  tsConfigFile: '/path/to/tsconfig.json',
})
```

#### Passing a custom ts-morph project (for the internal compiler)

(see [generate.ts](src/generate.ts) for the defaults)

```ts
import { Project } from 'ts-morph'

const generator = new Generator({
  targetFile: 'src/runtypes.ts',
  project: new Project({
    // ...
  }),
})
```

## Contributing

1. Install [Yarn](https://yarnpkg.com/)
1. Link your workspace `yarn`
1. If using VSCode, be sure to accept the workspace TypeScript version
1. If using another editor, install the [Yarn SDK](https://yarnpkg.com/getting-started/editor-sdks) for it (and commit with your PR)

## Thanks

Inspired by a [gist](https://gist.github.com/skurfuerst/a07ab23c3e40a45f2268f7700ceeceaf) by [skurfuerst](https://gist.github.com/skurfuerst).
