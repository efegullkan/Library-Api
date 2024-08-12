const helmet = require("helmet");
const compression = require("compression");
const bodyParser = require('body-parser');

module.exports = function(app) {
    app.use(helmet());
    app.use(compression());
    // JSON veri sınırı 1MB olarak ayarlanıyor
    app.use(bodyParser.json({ limit: '1mb' }));

    // URL-encoded veri sınırı 1MB olarak ayarlanıyor
    app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
}