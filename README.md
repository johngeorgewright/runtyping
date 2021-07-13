# runtypes-generator

Generate [runtypes](https://github.com/pelotom/runtypes) from static types.

This is still very much a work in progress, but you should be able to get up and running with some basic interfaces/aliases.

## Instructions

### Install

```
npm install -D runtypes-generator
```

### Configure

```yaml
# runtypes.gen.yml

# This file represents a list of files to create.
- targetFile: src/runtypes.ts # The file to create
  sourceTypes:
    - file: src/types.ts # The file where you type lives
      type: Foo # The type you want to convert to a runtype
```

### Run

```
npx rungen
```
