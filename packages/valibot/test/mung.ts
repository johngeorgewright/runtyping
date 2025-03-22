import * as v from 'valibot'

v.parse(
  v.intersect([
    v.record(v.string(), v.unknown()),
    v.custom((data) => !Array.isArray(data), 'Unexpected array'),
  ]),
  {}
)
