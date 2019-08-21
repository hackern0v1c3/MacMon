const Joi = require('@hapi/joi');
const regexTypes = require('./regex.js');

// {name: 'abc'}
const schema = Joi.object().keys({
    name: Joi.string().trim().min(3).max(99).regex(regexTypes.assetName, { invert: true }).required()
});

validateAssetType = assetType => {
    const result = schema.validate(assetType);
    return result.error;
}

module.exports = validateAssetType;