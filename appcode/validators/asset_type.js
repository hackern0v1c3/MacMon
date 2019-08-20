const Joi = require('@hapi/joi');

// {name: 'abc'}
const schema = Joi.object().keys({
    name: Joi.string().trim().min(3).max(99).regex(/[^a-zA-Z0-9\-_!\.@$?,;:& ]/, { invert: true }).required()
});

validateAssetType = assetType => {
    const result = schema.validate(assetType);
    return result.error;
}

module.exports = validateAssetType;