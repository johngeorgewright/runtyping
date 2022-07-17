import * as pathHelper from 'path'
import Generator from '../src/Generator'
import './global'

test('json schema', async () => {
  const generator = new Generator({
    factory: global.factory,
    targetFile: pathHelper.join(__dirname, `maxItems.schema.runtypes.ts`),
  })

  const file = await generator.generate({
    file: pathHelper.join(__dirname, 'maxItems.schema.json'),
    type: 'ExampleSchema',
  })

  expect(file!.getText()).toMatchSnapshot()
})
