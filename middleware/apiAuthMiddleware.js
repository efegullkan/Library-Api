const ApiKey = require('../models/apiKey');

module.exports = async function(req, res, next) {
    const apiKey = req.header('x-api-key');

    if (!apiKey) {
        return res.status(401).send('API key is required.');
    }

    try {
        const validApiKey = await ApiKey.findOne({ key: apiKey });

        if (!validApiKey) {
            return res.status(403).send('Invalid API key.');
        }

        next(); // Passed the middleware, proceed to the next operation
    } catch (error) {
        console.error('Error validating API key:', error);
        return res.status(500).send('Server error.');
    }
};
