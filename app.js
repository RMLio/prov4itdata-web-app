var express = require('express')
var session = require('express-session')
var grant = require('grant').express()


express()
  .use(session({secret: 'grant', saveUninitialized: true, resave: false}))
  .use(grant(require('./config.json')))
  .get('/', (req,res)=> {
      console.log("ROOT")
      console.log(grant.config)
      res.write('<a href="/connect/imgur">connect Imgur</a>')

  })
  .get('/hello', (req, res) => {
    res.end(JSON.stringify(req.session.grant.response, null, 2))
  })
  .listen(3000)