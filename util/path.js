const path = require('path');

//path to the app.js  process.mainModule.filename
module.exports = path.dirname(process.mainModule.filename);