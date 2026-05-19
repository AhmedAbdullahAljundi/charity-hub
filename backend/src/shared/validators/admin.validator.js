const { z } = require('zod');

const overrideRuleSchema = z.object({
  body: z.object({
    overrideValue: z.number().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)),
    reason: z.string().min(5),
  }),
  params: z.object({
    ruleId: z.string(),
  })
});

const simulateRuleSchema = z.object({
  body: z.object({
    overrideValue: z.number().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)),
  }),
  params: z.object({
    ruleId: z.string(),
  })
});

module.exports = { overrideRuleSchema, simulateRuleSchema };
