/*!
 * Microbase.tk: v0.0.65
 * Copyright(c) 2016-2018 Javanile.org
 * MIT Licensed
 */

const app = require('./src')
    , port = process.env.PORT || 3000

app.listen(port, function () {
    console.log('[Mircobase.tk] Server start on port', port);
});
