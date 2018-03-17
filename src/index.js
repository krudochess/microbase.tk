/*!
 * Microbase.tk: v0.0.65
 * Copyright(c) 2016-2018 Javanile.org
 * MIT Licensed
 */

const fs = require('fs')
    , express = require('express')
    , bodyParser = require('body-parser')
    , app = express()
    , client = require('./client')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('doc/www'))

app.post('/api/v1/auth/login', function (req, res) {
    const username = req.body.username
        , password = req.body.password

    client.startSession(function(session) {
        client.doLogin(username, password, session, function (data) {
            return res.send(data);
        })
    })
})

app.get('/api/v1/database', function (req, res) {
    const session = client.getSession(req.query.session);

    client.getDatabaseList(session, function(data) {
        return res.send(data);
    })
})

module.exports = app
