var express = require('express')
var session = require('express-session')
var grant = require('grant').express()
const axios = require('axios')
const {response} = require('express')
var fs = require('fs')
var path = require('path');

const getData = async (url, bearerToken, cb) => {
    try {
        const getResonse = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        })

        const data = await getResonse
        cb(data)
    } catch (error) {
        console.log(error)
    }
}

function getBearerToken(req) {
    if (req.session.hasOwnProperty('grant') && req.session.grant.hasOwnProperty('response'))
        // get the bearer token from session
        return req.session.grant.response['access_token']
    return null
}

const executeRMLMapping = async (mapping, cb) => {
    console.log("@executeRMLMapping")
    try {
        const urlRMLMapper = "http://localhost:4000/execute"

        // Construct the parameters used to execute the RML Mapping
        const paramsRMLMapperRequest = {
            'rml': mapping
        }

        const data = await axios.post(urlRMLMapper, paramsRMLMapperRequest)
        // Execute callback cb on result
        cb(data)

    } catch (error) {
        console.error(error.message)
    }
}

express()
    .use(session({secret: 'grant', saveUninitialized: true, resave: false}))
    .use(grant(require('./config.json')))

    // client-side Solid auth
    .use('/solid-auth', express.static(path.join(__dirname, 'solid-auth')))

    .get('/', (req, res) => {
        console.log("ROOT")

        res.write("<h1>ROOT</h1>")
        res.write('<ul>')
        res.write('<li><a href="/connect/imgur">connect Imgur</a></li>')
        res.write('<li> <a href="/get/imgur">simple GET request to Imgur</a></li>')
        res.write('<li> <a href="/solid-auth">Solid Authentication</a></li>')
        res.write('<li> <a href="/rmlmapper">RML Mapper example: generate RDF from Imgur API</a></li>')
        res.write('</ul>')

        if (req.session.hasOwnProperty('grant')) {
            res.write(JSON.stringify(req.session.grant.response, null, 2))

        }

        res.end("<p>fin</p>")

    })

    .get('/imgur/callback', (req, res) => {
        console.log("connect/imgur")
        res.write('<h1>imgur/callback</h1>')
        res.write(JSON.stringify(req.session.grant.response, null, 2))

        res.write('<br>')
        res.end('<a href="/"> go to root </a>')

    })

    .get('/get/imgur', (req, res) => {
        // url for GET request (should return a collection images for the logged in profile)
        const url = 'https://api.imgur.com/3/account/me/images'

        if (req.session.hasOwnProperty('grant') && req.session.grant.hasOwnProperty('response')) {

            // get the bearer token from session
            const bearerToken = req.session.grant.response['access_token']
            console.log('bearer token: ' + bearerToken)

            // execute the GET request
            getData(url, bearerToken, (response) => {
                const imageElements = response.data.data

                // create some html to render the images
                const html = imageElements.map(el =>
                    `<div id="${el.id}">     
                        <img src="${el.link}">
                        <p>${el.description}</p>
                        <p>views: ${el.views}</p>
                      </div>
                    `).join()
                res.send(html)
            })
        }

    })

    .get('/rmlmapper', (req, res) => {
        console.log("/rmlmapper")
        // Obtain Imgur bearer token
        const bearerToken = getBearerToken(req)

        // If we were able to get the bearer token then
        if (bearerToken != null) {

            // Read the RML Mapping
            const pathRMLMapping = "rml/imgur-002-TEMPLATED.ttl"
            var mappingTurtle = fs.readFileSync(pathRMLMapping, {'encoding': 'utf8'})

            // Replace template-variabe: authorizationHeader with the current bearer token
            const pattern = /\{{2}authorizationHeader\}{2}/
            const replacement = `Bearer ${bearerToken}`
            mappingTurtle = mappingTurtle.replace(pattern, replacement)

            // Execute it
            executeRMLMapping(mappingTurtle,
                // Process the reponse
                (response) => {
                    // If succesful, output the generated RDF as plain text
                    if (response.status == 200) {
                        var output = response.data.output
                        res.setHeader('Content-Type', 'text/plain')
                        res.send(output)
                    } else {
                        // Complain
                        console.error("Unsuccessful...")
                        console.error(response)
                        res.send(`<p style="color:red">FAILURE</p>`)
                    }
                }
            )

        } else {
            // The bearerToken was null, complain
            let errMessage = "No Imgur BearerToken available. Make sure to obtain one first!"
            console.error(errMessage)
            const html = `
              <p style="color:red">${errMessage}</p>
            `
            res.send(html)
        }
    })

    .listen(3000)