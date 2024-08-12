const ApiKey = require('../models/apiKey');
const crypto = require('crypto');

module.exports = async function generateApiKey() {
    const apiKey = new ApiKey({
        key: generateSecureRandomApiKey()
    });

    const savedApiKey = await apiKey.save();
    return savedApiKey.key;
}

function generateSecureRandomApiKey() {
    return crypto.randomBytes(32).toString('hex'); // 32 byte (256 bit) uzunluğunda güvenli rastgele dize oluşturma
}
