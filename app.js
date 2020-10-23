var express = require('express')
var session = require('express-session')
var grant = require('grant').express()
const axios = require('axios')

const getData = async (url, bearerToken) => {
  try {
    const data = await axios.get(url, {
      headers : {
        'Authorization' : `Bearer ${bearerToken}`
      }
    }).then(res => res.data)

    return data
  } catch (error) {
    console.log(error)
  }
}


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

    // url for GET request (should return a collection images for the logged in profile)
    const url = 'https://api.imgur.com/3/account/me/images'
  
    
    if(req.session.hasOwnProperty('grant') && req.session.grant.hasOwnProperty('response')) {

      // get the bearer token from session
      const bearerToken = req.session.grant.response['access_token']
      console.log('bearer token: ' + bearerToken)

      // execute the GET request 
      const data = getData(url, bearerToken)
      // when promise is fulfilled, log data to console
      data.then(d => console.log(d))
    }else {
      res.write("<p>No access token available...</p>")
      console.error("NO ACCESS TOKEN...")
    }
      
    
      res.end('<a href="/"> go to root </a>')

  })
  
  .listen(3000)