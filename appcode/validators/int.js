const Joi = require('@hapi/joi');

const schema = Joi.number().integer();

validateInt = input => {
    const result = schema.validate(input);
    return result.error;
}

module.exports = validateInt;