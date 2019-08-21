const Joi = require('@hapi/joi');
const regexTypes = require('./regex.js');

//{MAC: 'abc', Name: 'abc', Description: 'fgh', AssetType: 2}
const schema = Joi.object().keys({
    MAC: Joi.string().trim().regex(regexTypes.macAddress).required(),
    Name: Joi.string().trim().max(49).regex(regexTypes.assetName, { invert: true }).required().allow(''),
    Description: Joi.string().allow(null).trim().max(999).regex(regexTypes.multiLineDescription, { invert: true }).required().allow(''),
    AssetType: Joi.number().integer().required(),
    AssetTypeName: Joi.string().allow(null).optional()
});

validateAsset = asset => {
    const result = schema.validate(asset);
    return result.error;
}

module.exports = validateAsset;