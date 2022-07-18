import arrayTest from './array'
import booleanTest from './boolean'
import builtinTest from './builtin'
import circularTest from './circular-references'
import duplicateTest from './duplicate-references'
import enumTest from './enum'
import functionTest from './function'
import genericsTest from './generics'
import importTest from './import'
import inheritanceTest from './inheritance'
import interfaceTest from './interface'
import intersectionTest from './intersection'
import literalTest from './literal'
import maxItemsTest from './maxItems'
import minItemsTest from './minItems'
import namespaceTest from './namespace'
import nullTest from './null'
import numberTest from './number'
import optionalTest from './optional'
import recordTest from './record'
import recursiveTest from './recursive'
import schemaTest from './schema'
import stringTest from './string'
import tupleTest from './tuple'
import typeNameFormatTest from './typeNameFormat'
import unionTest from './union'
import unknownTest from './unknown'
import withoutTest from './without-static-types'
import { TypeWriterTestProps } from './types'

export default function testTypeWriter(props: TypeWriterTestProps) {
  arrayTest(props)
  booleanTest(props)
  builtinTest(props)
  circularTest(props)
  duplicateTest(props)
  enumTest(props)
  functionTest(props)
  genericsTest(props)
  importTest(props)
  inheritanceTest(props)
  interfaceTest(props)
  intersectionTest(props)
  literalTest(props)
  maxItemsTest(props)
  minItemsTest(props)
  namespaceTest(props)
  nullTest(props)
  numberTest(props)
  optionalTest(props)
  recordTest(props)
  recursiveTest(props)
  schemaTest(props)
  stringTest(props)
  tupleTest(props)
  typeNameFormatTest(props)
  unionTest(props)
  unknownTest(props)
  withoutTest(props)
}
