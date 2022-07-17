# <%=fullName%>

Generate <%=name%> from static types & JSON schema.

## Instructions

### Install

```
npm install <%=name%>
npm install -D <%=fullName%>
```

### Use from the command line

1. Create a file, in the root of your project, called "runtyping.yml".

   ```yaml
   # runtyping.yml

   targetFile: src/other-runtypes.ts # The file to create
   runtypeFormat: {type}Rt # Optional: use a custom name format for the created runtype
   typeFormat: {type}Type  # Optional: use a custom name format for the created type
   sourceTypes:
     exportStaticType: true # Optional: export static types as well (true by default)
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
import { Generator } from '<%=fullName%>'

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
import { Generator } from '<%=fullName%>'
const generator = new Generator({
  targetFile: 'src/runtypes.ts',
  tsConfigFile: '/path/to/tsconfig.json',
})
```

#### Passing a custom ts-morph project (for the internal compiler)

(see [generate.ts](src/generate.ts) for the defaults)

```ts
import { Project } from 'ts-morph'
import { Generator } from '<%=fullName%>'

const generator = new Generator({
  targetFile: 'src/runtypes.ts',
  project: new Project({
    // ...
  }),
})
```
