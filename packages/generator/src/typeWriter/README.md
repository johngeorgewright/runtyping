# The TypeWriter

These generators instruct how to compose a runtype. As example, take the [`simpleTypeWriter`](simple.ts).

```typescript
function* simpleTypeWriter(type: string): TypeWriter {
  yield [Import, type]
  yield [Write, type]
}
```

`simpleTypeWriter('String')` would instruct the generator to import the given type from `runtypes` then write the word `String`. Using this technique means it can be used by other type generators:

```typescript
function* stringArrayTypeWriter(): TypeWriter {
  yield [Import 'Array']
  yield [Write, 'Array(']
  yield* simpleTypeWriter('String')
  yield [Write, ')']
}
```

This example is a little crude, but it can give one the idea of how it's used.
