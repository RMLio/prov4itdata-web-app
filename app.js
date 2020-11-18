const express = require('express')
const session = require('express-session')
const Grant = require('grant').express()
const grant = Grant(require('./config.json'))
const path = require('path');
const https = require('https')
const pem = require('pem')
const router = require('./routes/index')

// Configuration
const PORT = 3000

const config = {
    logConfig : {
        logRoute : true,
        logErrors : true
    }
}

// Web App
const app = express()
app.set('view engine', 'pug')
    .use(session({secret: 'grant', saveUninitialized: true, resave: false}))
    .use(grant)
    // client-side Solid auth
    .use('/solid-auth', express.static(path.join(__dirname, 'solid-auth')))
    .use('/', router(grant, config))

// Enable HTTPS / Crete certificate
pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
    console.log("create cert")
    if (err) {
        throw err
    }
    https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app).listen(PORT)
})
