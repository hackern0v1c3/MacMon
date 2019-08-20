const Joi = require('@hapi/joi');

const schema = Joi.string().ip({
    version: ['ipv4'],
    cidr: 'forbidden'
});

validateIp = input => {
    const result = schema.validate(input);
    return result.error;
}

module.exports = validateIp;