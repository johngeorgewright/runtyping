import { any, array, boolean, number, string } from 'zod';
import { validators } from '@runtyping/zod';
import { A as _A, B as _B, C as _C, D as _D, E as _E } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/variadicTuples';

export const A = array(any())
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
      path: 1,
      type: array(string())
    })

  });

export type A = typeof A;

export const B = array(any())
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
      path: 2,
      type: array(number())
    })

  });

export type B = typeof B;

export const C = array(any())
  .min(1)
  .superRefine((data, ctx) => {
    validators.pipeIssues({
      ctx,
      data: data.slice(0, -1),
      path: 0,
      type: array(string())
    })
    validators.pipeIssues({
      ctx,
      data: data.slice(-1)[0],
      path: -1,
      type: number()
    });

  });

export type C = typeof C;

export const D = array(any())
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
      path: 1,
      type: array(string())
    })
    validators.pipeIssues({
      ctx,
      data: data.slice(-1)[0],
      path: -1,
      type: string()
    });

  });

export type D = typeof D;

export const E = array(any())
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
      path: 3,
      type: array(string())
    })
    validators.pipeIssues({
      ctx,
      data: data.slice(-2)[0],
      path: -2,
      type: number()
    });
    validators.pipeIssues({
      ctx,
      data: data.slice(-1)[0],
      path: -1,
      type: boolean()
    });

  });

export type E = typeof E;
