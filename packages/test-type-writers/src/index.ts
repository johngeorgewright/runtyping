import arrayTest from './tests/array'
// import booleanTest from './tests/boolean'
// import builtinTest from './tests/builtin'
// import circularTest from './tests/circular-references'
// import duplicateTest from './tests/duplicate-references'
// import enumTest from './tests/enum'
// import functionTest from './tests/function'
// import genericsTest from './tests/generics'
// import importTest from './tests/import'
// import inheritanceTest from './tests/inheritance'
// import interfaceTest from './tests/interface'
// import intersectionTest from './tests/intersection'
// import literalTest from './tests/literal'
// import maxItemsTest from './tests/maxItems'
// import minItemsTest from './tests/minItems'
// import namespaceTest from './tests/namespace'
// import nullTest from './tests/null'
// import numberTest from './tests/number'
// import optionalTest from './tests/optional'
// import recordTest from './tests/record'
// import recursiveTest from './tests/recursive'
// import schemaTest from './tests/schema'
// import stringTest from './tests/string'
// import tupleTest from './tests/tuple'
// import typeNameFormatTest from './tests/typeNameFormat'
// import unionTest from './tests/union'
// import unknownTest from './tests/unknown'
// import withoutTest from './tests/without-static-types'
import { TypeWriterTestProps } from './types'

export default function testTypeWriters<Validator>(
  props: TypeWriterTestProps<Validator>
) {
  arrayTest(props)
  // booleanTest(props)
  // builtinTest(props)
  // circularTest(props)
  // duplicateTest(props)
  // enumTest(props)
  // functionTest(props)
  // genericsTest(props)
  // importTest(props)
  // inheritanceTest(props)
  // interfaceTest(props)
  // intersectionTest(props)
  // literalTest(props)
  // maxItemsTest(props)
  // minItemsTest(props)
  // namespaceTest(props)
  // nullTest(props)
  // numberTest(props)
  // optionalTest(props)
  // recordTest(props)
  // recursiveTest(props)
  // schemaTest(props)
  // stringTest(props)
  // tupleTest(props)
  // typeNameFormatTest(props)
  // unionTest(props)
  // unknownTest(props)
  // withoutTest(props)
}
