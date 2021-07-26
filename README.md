# runtyping

Generate [runtypes](https://github.com/pelotom/runtypes) from static types & JSON schema.

## Instructions

### Install

```
npm install runtypes
npm install -D runtyping
```

### Configure

Create a file, in the root of your project, called "runtypes.gen.yml".

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

## Thanks

Inspired by a [gist](https://gist.github.com/skurfuerst/a07ab23c3e40a45f2268f7700ceeceaf) by [skurfuerst](https://gist.github.com/skurfuerst).
