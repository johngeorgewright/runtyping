import { any as Any, array, boolean, number, string } from 'zod';
import { A as _A, B as _B, C as _C, D as _D, E as _E } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/variadicTuples';
import { validators } from '@runtyping/zod';

export const A = array(Any())
  .min(1)
  .superRefine((data, ctx) => {
    validators.pipeIssues({
      ctx,
      data: data[0],
      path: 0,
      type: string()
    });
    validators.pipeIssues({
      ctx,
      data: data.slice(1, undefined),
      path: `1-${1 + data.slice(1, undefined).length}`,
      type: array(string())
    });
  });

export type A = _A;

export const B = array(Any())
  .min(2)
  .superRefine((data, ctx) => {
    validators.pipeIssues({
      ctx,
      data: data[0],
      path: 0,
      type: string()
    });
    validators.pipeIssues({
      ctx,
      data: data[1],
      path: 1,
      type: number()
    });
    validators.pipeIssues({
      ctx,
      data: data.slice(2, undefined),
      path: `2-${2 + data.slice(2, undefined).length}`,
      type: array(number())
    });
  });

export type B = _B;

export const C = array(Any())
  .min(1)
  .superRefine((data, ctx) => {
    validators.pipeIssues({
      ctx,
      data: data.slice(0, -1),
      path: `0-${0 + data.slice(0, -1).length}`,
      type: array(string())
    });
    validators.pipeIssues({
      ctx,
      data: data[data.length - 1],
      path: data.length - 1,
      type: number()
    });
  });

export type C = _C;

export const D = array(Any())
  .min(2)
  .superRefine((data, ctx) => {
    validators.pipeIssues({
      ctx,
      data: data[0],
      path: 0,
      type: string()
    });
    validators.pipeIssues({
      ctx,
      data: data.slice(1, -1),
      path: `1-${1 + data.slice(1, -1).length}`,
      type: array(string())
    });
    validators.pipeIssues({
      ctx,
      data: data[data.length - 1],
      path: data.length - 1,
      type: string()
    });
  });

export type D = _D;

export const E = array(Any())
  .min(5)
  .superRefine((data, ctx) => {
    validators.pipeIssues({
      ctx,
      data: data[0],
      path: 0,
      type: string()
    });
    validators.pipeIssues({
      ctx,
      data: data[1],
      path: 1,
      type: number()
    });
    validators.pipeIssues({
      ctx,
      data: data[2],
      path: 2,
      type: boolean()
    });
    validators.pipeIssues({
      ctx,
      data: data.slice(3, -2),
      path: `3-${3 + data.slice(3, -2).length}`,
      type: array(string())
    });
    validators.pipeIssues({
      ctx,
      data: data[data.length - 2],
      path: data.length - 2,
      type: number()
    });
    validators.pipeIssues({
      ctx,
      data: data[data.length - 1],
      path: data.length - 1,
      type: boolean()
    });
  });

export type E = _E;
