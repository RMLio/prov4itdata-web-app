var express = require('express')
var session = require('express-session')
var grant = require('grant').express()
const axios = require('axios')

express()
  .use(session({secret: 'grant', saveUninitialized: true, resave: false}))
  .use(grant(require('./config.json')))
  .get('/', (req,res)=> {
      console.log("ROOT")

      
     
      res.write("<h1>ROOT</h1>")
      res.write('<ul>')
      res.write('<li><a href="/connect/imgur">connect Imgur</a></li>')
      res.write('<li> <a href="/get/imgur">simple GET request to Imgur</a></li>')
      res.write('</ul>')

      if(req.session.hasOwnProperty('grant')) {
        res.write(JSON.stringify(req.session.grant.response, null, 2))

      }
      


      res.end("<p>fin</p>")

      
  })
  .get('/imgur/callback', (req,res)=> {
    console.log("connect/imgur")
    res.write('<h1>imgur/callback</h1>')
    res.write(JSON.stringify(req.session.grant.response, null, 2))


    res.write('<br>')
    res.end('<a href="/"> go to root </a>')

  })



  .get('/get/imgur', (req, res) => {
    res.write('<h1>Getting Imgur data</h1>')
    const url = 'https://api.imgur.com/3/account/me/images'
    
    const getData = async (url) => {
      try {
        const response = await axios.get(url)
        const data = response.data
        console.log(data)
      } catch (error) {
        console.log(error)
      }
    }
    
    getData(url)


    res.end()

  })
  
  .listen(3000)