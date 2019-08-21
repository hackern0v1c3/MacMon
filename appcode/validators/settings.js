const Joi = require('@hapi/joi');
const regexTypes = require('./regex.js');

// {"CidrRanges":["192.168.1.0/24"],
// "scanInterval":300,
// "emailServer":"smtp.office365.com",
// "smtpPort":587,
// "emailSender":"sender@example.local",
// "emailSenderUsername":"sender@example.local",
// "emailRecipient":"recipient@example.local",
// "emailTls":"True",
// "emailNotifications":"False",
// "emailSenderPassword":"test"}

const schema = Joi.object().keys({
    CidrRanges: Joi.array().items(Joi.string().ip({version: ['ipv4'], cidr: 'required'})).required(),
    scanInterval: Joi.number().integer().max(604800).required(),
    emailServer: Joi.string().trim().max(49).regex(regexTypes.serverName, { invert: true }).required(),
    smtpPort: Joi.number().integer().max(65534).required(),
    emailSender: Joi.string().trim().max(49).regex(regexTypes.emailAddress, { invert: true }).required(),
    emailSenderUsername: Joi.string().trim().max(49).regex(regexTypes.userName, { invert: true }).required(),
    emailRecipient: Joi.string().trim().max(49).regex(regexTypes.emailAddress, { invert: true }).required(),
    emailTls: Joi.boolean().required(),
    emailNotifications: Joi.boolean().required(),
    emailSenderPassword: Joi.string().allow('').optional().strip()
});

validateSettings = settings => {
    const result = schema.validate(settings);
    return result.error;
}

module.exports = validateSettings;