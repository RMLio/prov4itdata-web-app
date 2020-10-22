var express = require('express')
var session = require('express-session')
var grant = require('grant').express()


express()
  .use(session({secret: 'grant', saveUninitialized: true, resave: false}))
  .use(grant(require('./config.json')))
  .get('/', (req,res)=> {
      console.log("ROOT")

      
      console.log("req.query: ", req.query)

      res.write("<p>access token: "+ req.query.access_token + "</p>");
      res.write("<p>refresh token: "+ req.query.refresh_token + "</p>");
      res.write("<p>scope : "+ req.query.scope + "</p>");
  
      res.write('<a href="/connect/imgur">connect Imgur</a>')


      res.end("<p>fin</p>")

      
  })
  .get('connect/imgur/callback', (req,res)=> {
    console.log("connect/imgur/callback")
    res.write('<h1>Wow.</h1>')

})
  .get('/hello', (req, res) => {
    res.end(JSON.stringify(req.session.grant.response, null, 2))
  })
  .listen(3000)