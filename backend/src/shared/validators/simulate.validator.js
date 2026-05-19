const { z } = require('zod');

const simulateSchema = z.object({
  body: z.object({
    householdId: z.string().cuid(),
    modifications: z.array(z.object({
      field: z.string(),
      value: z.any()
    }))
  })
});

module.exports = { simulateSchema };
