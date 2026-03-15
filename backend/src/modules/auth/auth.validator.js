/**
 * Authentication Validators
 * 
 * Input validation for authentication endpoints
 */

const Joi = require('joi')

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'البريد الإلكتروني غير صحيح',
      'any.required': 'البريد الإلكتروني مطلوب',
      'string.empty': 'البريد الإلكتروني لا يمكن أن يكون فارغاً',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'كلمة المرور يجب أن تكون على الأقل 6 أحرف',
      'any.required': 'كلمة المرور مطلوبة',
      'string.empty': 'كلمة المرور لا يمكن أن تكون فارغة',
    }),
})

/**
 * Validate login request
 * @param {Object} data - Request body
 * @returns {Object} Validation result
 */
function validateLogin(data) {
  const { error, value } = loginSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  })

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }))

    return {
      isValid: false,
      errors,
      value: null,
    }
  }

  return {
    isValid: true,
    errors: null,
    value,
  }
}

module.exports = {
  validateLogin,
  loginSchema,
}
