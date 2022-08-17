# @runtyping/test-type-writers

A testing library for runtyping typewriters.

## Usage

```ts
testTypeWriters<MyBaseValidatorType>({
  createNumberValidator: () => NumberValidator,
  createStringValidator: () => StringValidator,
  createObjectValidator: (shape) => ObjectValidator(shape),
  typeWriters: new MyTypeWriters(),
  validate(validator, data) {
    // should throw an error if it fails
    validator.validate(data)
  },

  // optional, ignore certain tests if they can't be achieved
  // by the validator
  ignore: ['variadicTuples.B'],
})
```

## Adding a test

1. Create a source fixture in `fixtures/source`. This will represent a source files containing static types we wish to build validators against.
1. Create a data fixture in `fixtures/data`, with the same name you gave the source file. It should contain an array of `success` and `failure` data inputs for each type exported from the source file.

See `fixtures/source/array.ts` & `fixtures/data/array.ts` as an example.
