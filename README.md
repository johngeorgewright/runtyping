# runtypes-generator

Generate [runtypes](https://github.com/pelotom/runtypes) from static types.

## Instructions

### Install

```
npm install runtypes
npm install -D runtypes-generator
```

### Configure

```yaml
# runtypes.gen.yml

# This config represents a list of files to create.
- targetFile: src/runtypes.ts # The file to create
  sourceTypes:
    - file: src/types.ts # The file where your type lives
      type: Foo # The type you want to convert to a runtype

    - file: json/my-json-schema.json # You can even use JSON schema files!!
      type: ExampleType
```

### Run

```
npx rungen
```

### Known Issues

- [ ] Unable to parse enums
