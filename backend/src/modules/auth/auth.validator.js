const Joi = require('joi');

function validateLogin(body) {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(1).required(),
  });
  const { error, value } = schema.validate(body, { abortEarly: false });
  if (error) {
    return { isValid: false, errors: error.details.map((d) => d.message) };
  }
  return { isValid: true, value };
}

function validateRefresh(body) {
  const schema = Joi.object({
    refreshToken: Joi.string().required(),
  });
  const { error, value } = schema.validate(body);
  if (error) return { isValid: false, errors: error.details.map((d) => d.message) };
  return { isValid: true, value };
}

module.exports = { validateLogin, validateRefresh };
