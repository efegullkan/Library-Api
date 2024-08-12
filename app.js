const express = require("express");
const app = express();


require('express-async-errors');
require("./startup/information");
require("./startup/logger");
require("./startup/routes")(app);
require("./startup/db")();
// require("./startup/apiKeyService");
if(process.env.NODE_ENV == "production") {
    require("./startup/production")(app);
}

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});