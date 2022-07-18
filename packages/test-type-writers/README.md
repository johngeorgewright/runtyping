# @runtyping/test-type-writers

A testing library for runtyping typewriters.

When used with yarn in strict mode, you will need to resolve some dependencies. For example, if you are building `runtypes`:

```yml
# .yarnrc.yml

packageExtensions:
  '@runtyping/test-type-writers@*':
    dependencies:
      runtypes: 'npm:runtypes@*'
```
