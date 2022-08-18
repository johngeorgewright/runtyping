import { any as Any, array, object, record, string, undefined as Undefined, unknown as Unknown } from 'zod';
import { validators } from '@runtyping/zod';

export const ExampleSchema = object({
  testArray: array(Any())
    .min(2)
    .superRefine((data, ctx) => {
      validators.pipeIssues({
        ctx,
        data: data[0],
        path: 0,
        type: record(string(), Unknown())
      });
      validators.pipeIssues({
        ctx,
        data: data[1],
        path: 1,
        type: record(string(), Unknown())
      });
      validators.pipeIssues({
        ctx,
        data: data.slice(2, undefined),
        path: 2,
        type: array(record(string(), Unknown()))
      });

    }).or(Undefined()).optional(),
});

export type ExampleSchema = [{ [k: string]: unknown; }, { [k: string]: unknown; }, ...{ [k: string]: unknown; }[]];
