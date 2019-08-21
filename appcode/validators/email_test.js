const Joi = require('@hapi/joi');
const regexTypes = require('./regex.js');

// {"emailServer":"smtp.office365.com",
// "smtpPort":587,
// "emailSender":"sender@example.local",
// "emailRecipient":"recipient@example.local",
// "emailSenderUsername":"sender@example.local",
// "emailTls":"True",
// "emailSenderPassword":"test"}

const schema = Joi.object().keys({
    emailServer: Joi.string().trim().max(49).regex(regexTypes.serverName, { invert: true }).required(),
    smtpPort: Joi.number().integer().max(65534).required(),
    emailSender: Joi.string().trim().max(49).regex(regexTypes.emailAddress, { invert: true }).required(),
    emailRecipient: Joi.string().trim().max(49).regex(regexTypes.emailAddress, { invert: true }).required(),
    emailSenderUsername:  Joi.string().trim().max(49).regex(regexTypes.userName, { invert: true }).required(),
    emailTls: Joi.boolean().required(),
    emailSenderPassword: Joi.string().allow('').optional().strip()
});

validateEmailTestSettings = emailTestSettings => {
    const result = schema.validate(emailTestSettings);
    return result.error;
}

module.exports = validateEmailTestSettings;