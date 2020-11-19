const express = require('express')
const session = require('express-session')
const Grant = require('grant').express()
const grant = Grant(require('./config.json'))
const path = require('path');
const https = require('https')
const pem = require('pem')
const router = require('./routes/index')
const fs = require('fs')

// Configuration
const PORT = 3000
const USE_HTTPS = true
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
    .use(express.static('public'))

if(USE_HTTPS){
    console.log("USING HTTPS")
    // Enable HTTPS / Create certificate
    pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
        console.log("created certificate")
        if (err) {
            throw err
        }
        https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app).listen(PORT)
    })
}else {
    console.log("USING HTTP")
    app.listen(PORT)
}