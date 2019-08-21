const Joi = require('@hapi/joi');
const regexTypes = require('./regex.js');

const schema = Joi.string().trim().regex(regexTypes.macAddress);

validateMac = input => {
    const result = schema.validate(input);
    return result.error;
}

module.exports = validateMac;