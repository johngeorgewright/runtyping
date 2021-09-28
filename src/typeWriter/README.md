# The TypeWriter

These generators instruct how to compose a runtype. As example, take the [`simpleTypeGenerator`](simple.ts).

```typescript
function* simpleTypeGenerator(type: string): TypeWriter {
  yield [Import, type]
  yield [Write, type]
}
```

`simpleTypeGenerator('String')` would instruct the generator to import the given type from `runtypes` then write the word `String`. Using this technique means it can be used by other type generators:

```typescript
function* stringArrayTypeGenerator(): TypeWriter {
  yield [Import 'Array']
  yield [Write, 'Array(']
  yield* simpleTypeGenerator('String')
  yield [Write, ')']
}
```

This example is a little crude, but it can give one the idea of how it's used.
