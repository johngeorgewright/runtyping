import { RefinementCtx, ZodTypeAny } from 'zod'

export function pipeIssues({ ctx, data, path, type }: PipeIssuesParams) {
  const result = type.safeParse(data)
  if (!result.success)
    for (const issue of result.error.issues)
      ctx.addIssue({
        ...issue,
        path: [path, ...issue.path],
      })
}

export interface PipeIssuesParams {
  ctx: RefinementCtx
  data: unknown
  path: string | number
  type: ZodTypeAny
}
