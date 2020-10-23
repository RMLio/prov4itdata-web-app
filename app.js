var express = require('express')
var session = require('express-session')
var grant = require('grant').express()
const axios = require('axios')
const { response } = require('express')

const getData = async (url, bearerToken, cb) => {
  try {
    const getResonse = await axios.get(url, {
      headers : {
        'Authorization' : `Bearer ${bearerToken}`
      }
    })

    const data = await getResonse
    cb(data)
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

    // url for GET request (should return a collection images for the logged in profile)
    const url = 'https://api.imgur.com/3/account/me/images'
  
    
    if(req.session.hasOwnProperty('grant') && req.session.grant.hasOwnProperty('response')) {

      // get the bearer token from session
      const bearerToken = req.session.grant.response['access_token']
      console.log('bearer token: ' + bearerToken)

      // execute the GET request 
     getData(url, bearerToken, (response) => {
      const imageElements = response.data.data

      // create some html to render the images 
      const html = imageElements.map(el => 
        `
          <div id="${el.id}">     
            <img src="${el.link}">
            <p>${el.description}</p>
            <p>views: ${el.views}</p>
          </div>
        `).join()

      res.send(html)
     })    
    }

  })
  
  .listen(3000)