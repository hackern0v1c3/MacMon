const Joi = require('@hapi/joi');

const schema = Joi.string().trim().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/);

validateMac = input => {
    const result = schema.validate(input);
    return result.error;
}

module.exports = validateMac;