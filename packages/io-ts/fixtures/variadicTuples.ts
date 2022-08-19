import { array, boolean, failure, number, string, success, Type, TypeOf, unknown as Unknown } from 'io-ts';
import { A as _A, B as _B, C as _C, D as _D, E as _E } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/variadicTuples';

export const A = array(Unknown).pipe(new Type<_A, _A, unknown[]>(
  '_A',
  (u): u is _A =>
    Array.isArray(u) && u.length >= 1
    && string.is(u[0])
    && array(string).is(u.slice(1, undefined)),
  (i, c) =>
    i.length >= 1
      && string.is(i[0])
      && array(string).is(i.slice(1, undefined))
      ? success(i as _A)
      : failure(i, c, 'Variadic tuple does not match schema'),
  (a) => a
));

export type A = TypeOf<typeof A>;

export const B = array(Unknown).pipe(new Type<_B, _B, unknown[]>(
  '_B',
  (u): u is _B =>
    Array.isArray(u) && u.length >= 2
    && string.is(u[0])
    && number.is(u[1])
    && array(number).is(u.slice(2, undefined)),
  (i, c) =>
    i.length >= 2
      && string.is(i[0])
      && number.is(i[1])
      && array(number).is(i.slice(2, undefined))
      ? success(i as _B)
      : failure(i, c, 'Variadic tuple does not match schema'),
  (a) => a
));

export type B = TypeOf<typeof B>;

export const C = array(Unknown).pipe(new Type<_C, _C, unknown[]>(
  '_C',
  (u): u is _C =>
    Array.isArray(u) && u.length >= 1
    && array(string).is(u.slice(0, -1))
    && number.is(u[u.length - 1]),
  (i, c) =>
    i.length >= 1
      && array(string).is(i.slice(0, -1))
      && number.is(i[i.length - 1])
      ? success(i as _C)
      : failure(i, c, 'Variadic tuple does not match schema'),
  (a) => a
));

export type C = TypeOf<typeof C>;

export const D = array(Unknown).pipe(new Type<_D, _D, unknown[]>(
  '_D',
  (u): u is _D =>
    Array.isArray(u) && u.length >= 2
    && string.is(u[0])
    && array(string).is(u.slice(1, -1))
    && string.is(u[u.length - 1]),
  (i, c) =>
    i.length >= 2
      && string.is(i[0])
      && array(string).is(i.slice(1, -1))
      && string.is(i[i.length - 1])
      ? success(i as _D)
      : failure(i, c, 'Variadic tuple does not match schema'),
  (a) => a
));

export type D = TypeOf<typeof D>;

export const E = array(Unknown).pipe(new Type<_E, _E, unknown[]>(
  '_E',
  (u): u is _E =>
    Array.isArray(u) && u.length >= 5
    && string.is(u[0])
    && number.is(u[1])
    && boolean.is(u[2])
    && array(string).is(u.slice(3, -2))
    && number.is(u[u.length - 2])
    && boolean.is(u[u.length - 1]),
  (i, c) =>
    i.length >= 5
      && string.is(i[0])
      && number.is(i[1])
      && boolean.is(i[2])
      && array(string).is(i.slice(3, -2))
      && number.is(i[i.length - 2])
      && boolean.is(i[i.length - 1])
      ? success(i as _E)
      : failure(i, c, 'Variadic tuple does not match schema'),
  (a) => a
));

export type E = TypeOf<typeof E>;
