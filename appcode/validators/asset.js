const Joi = require('@hapi/joi');

//{MAC: 'abc', Name: 'abc', Description: 'fgh', AssetType: 2}
const schema = Joi.object().keys({
    MAC: Joi.string().trim().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).required(),
    Name: Joi.string().trim().max(49).regex(/[^a-zA-Z0-9\-_!\.@$?,;:& ]/, { invert: true }).required().allow(''),
    Description: Joi.string().allow(null).trim().max(999).regex(/[^a-zA-Z0-9\-_!\.@$?,;:&/\n/ ]/, { invert: true }).required().allow(''),
    AssetType: Joi.number().integer().required(),
    AssetTypeName: Joi.string().allow(null).optional()
});

validateAsset = asset => {
    const result = schema.validate(asset);
    return result.error;
}

module.exports = validateAsset;