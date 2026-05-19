const { z } = require('zod');

const bulkVerifySchema = z.object({
  body: z.object({
    ids: z.array(z.string().cuid()),
    verified: z.enum(['VERIFIED', 'UNVERIFIED', 'REJECTED']),
    verificationNote: z.string().optional(),
  })
});

module.exports = { bulkVerifySchema };
