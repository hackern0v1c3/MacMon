const Joi = require('@hapi/joi');

const schema = Joi.string();

validatePasswordReset = (password, confirmPassword) => {
    if (password != confirmPassword) {
        return 'passwords do not match';
    }

    const result = schema.validate(password);
    return result.error;
}

module.exports = validatePasswordReset;