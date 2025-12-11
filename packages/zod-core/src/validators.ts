import { $RefinementCtx, $SafeParse, $ZodType } from 'zod/v4/core'

export function pipeIssues(
  safeParse: $SafeParse,
  { ctx, data, path, type }: PipeIssuesParams,
) {
  const result = safeParse(type, data)
  if (!result.success)
    for (const issue of result.error.issues)
      ctx.addIssue({
        ...issue,
        path: [path, ...issue.path],
      })
}

export interface PipeIssuesParams {
  ctx: $RefinementCtx
  data: unknown
  path: string | number
  type: $ZodType
}
