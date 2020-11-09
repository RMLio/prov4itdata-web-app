var express = require('express')
var session = require('express-session')
var grant = require('grant').express()
const axios = require('axios')
const {response} = require('express')
var fs = require('fs')
var path = require('path');
// controllers
var rmlRulesController = require('./controllers/rmlRulesController')
var tokenController = require('./controllers/tokenController')

const getData = async (url) => {
    const data = await axios.get(url)
    return data
}
const getAuthorizedData = async (url, bearerToken, cb) => {
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
const executeRMLMapping = async (mapping, cb) => {
    console.log("@executeRMLMapping")
    try {
        const urlRMLMapper = "http://localhost:4000/execute"

        // Construct the parameters used to execute the RML Mapping
        const paramsRMLMapperRequest = {
            'rml': mapping,
            'generateMetadata': true
        }

        const data = await axios.post(urlRMLMapper, paramsRMLMapperRequest)
        // Execute callback cb on result
        cb(data)

    } catch (error) {
        console.error(error.message)
    }
}

express()
    .set('view engine', 'pug')
    .use(session(
        {secret: 'grant',
            saveUninitialized: true,
            resave: false
        }))
    .use(grant(require('./config.json')))
    // client-side Solid auth
    .use('/solid-auth', express.static(path.join(__dirname, 'solid-auth')))

    .get('/', (req,res)=>{

        if(req.session.pageViews)
            console.log("pageviews: ", req.session.pageViews)

        // Create key-value pairs for the access tokens
        const tokenPairs = []
        const bearerToken = tokenController.getBearerToken(req)
        if(bearerToken !== null)
            tokenPairs.push({'service' : 'imgur', 'token' : bearerToken})


        // Create key-value pairs for each RML Mapping file
        const downloadRoutes = rmlRulesController.mappingList()
            .flatMap((f)=>[{
            'text':f, 'href':path.join('/download/rml', f)
        }])
        // Create key-value pairs for the routes to pages
        const authRoutes = [
            {'text': 'Connect Imgur', 'href':'/connect/imgur'},
            {'text': 'Solid Authentication', 'href':'/solid-auth'},
        ]
        // Create key-value pairs for the routes to test GET requests to the services (e.g. Imgur)
        const serviceGetRoutes = [
            {'text': 'Imgur: GET my images', 'href':'/get/imgur'},
        ]

        // Create key-value pairs for routes for executing RML Rules
        const executeMappingRoutes = rmlRulesController.mappingList()
            .flatMap((f)=>[{'text':f, 'href':path.join('/rmlmapper', f)}])

        // Create key-value pairs for routes for executing the transfer pipeline
        const transferRoutes = rmlRulesController.mappingList()
            .flatMap((f)=>[{'text':f, 'href':path.join('/transfer', f)}])


        // Construct render parameters
        var paramsRender = {
            'tokenPairs' : tokenPairs,
            'downloadRoutes' : downloadRoutes,
            'authRoutes': authRoutes,
            'serviceGetRoutes' : serviceGetRoutes,
            'executeMappingRoutes' : executeMappingRoutes,
            'transferRoutes' : transferRoutes
        }
        // Render
        res.render('index', paramsRender)
    })
    .get('/v1', (req, res) => {
        console.log("ROOT")

        res.write("<h1>ROOT</h1>")
        res.write('<ul>')
        res.write('<li><a href="/connect/imgur">connect Imgur</a></li>')
        res.write('<li> <a href="/get/imgur">simple GET request to Imgur</a></li>')
        res.write('<li> <a href="/solid-auth">Solid Authentication</a></li>')

        // Create links for executing the available mappings
        res.write('<li>Execute RML Mappings:</li>')
        res.write('<ul>')
        rmlRulesController.mappingList().forEach(
            (filename, index, array)=>
                res.write(`<li> <a href="/rmlmapper/${filename}">Execute mapping: ${filename}</a></li>`)
        )
        res.write('</ul>')

        res.write('<li> <a href="/rmlmapper">RML Mapper example: generate RDF from Imgur API</a></li>')
        res.write('<li> <a href="/transfer/imgur-002-TEMPLATED.ttl">Transfer</a></li>')
        res.write('<li> <a href="/rml/rules/">get RML Rules </a></li>')
        res.write('<li> <a href="/test/controllers/rmlRulesController">test RML Rules controller</a></li>')
        res.write('<li> <a href="/v2">V2</a></li>')

        res.write('</ul>')

        if (req.session.hasOwnProperty('grant')) {
            res.write(JSON.stringify(req.session.grant.response, null, 2))

        }

        res.end("<p>fin</p>")

    })

    .get('/imgur/callback', (req, res) => {
        res.redirect('/')
    })

    .get('/get/imgur', (req, res) => {
        // url for GET request (should return a collection images for the logged in profile)
        const url = 'https://api.imgur.com/3/account/me/images'

        const bearerToken = tokenController.getBearerToken(req)
        if (bearerToken !== null) {
            console.log('bearer token: ' + bearerToken)

            // execute the GET request
            getAuthorizedData(url, bearerToken, (response) => {
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
        }else
            res.sendStatus(401) // 401: Unauthorized
    })
    .get('/rml/rules/:filename?', (req, res)=> {
        console.log("/rml/rules/:filename")
        const filename = req.params.filename
        // When the filename parameter is not provided, return the available mapping files
        if(filename === undefined){
            res.send(rmlRulesController.mappingList())
        }
        // If the filename parameter is defined, return the file it points to, if it exists.
        else {
            const mapping = rmlRulesController.readMapping(filename)
            if(mapping != null)
                res.send(mapping)
            else
                res.sendStatus(404)
        }
    })

    .get('/rmlmapper/:filename?', (req, res) => {
        console.log("/rmlmapper")
        // Obtain Imgur bearer token
        const bearerToken = tokenController.getBearerToken(req)

        // If we were able to get the bearer token then
        if (bearerToken != null) {

            // Read the RML Mapping (if filename is set in the URL, that one will be used.
            // Otherwise, the default filename will be used)
            const pathRMLMapping = path.join('rml',req.params.filename !== undefined ? req.params.filename : "imgur-002-TEMPLATED.ttl")
            console.log("pathRMLMapping: ", pathRMLMapping)
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
                        var metadata = response.data.metadata

                        const contentType = req.headers['content-type']

                        // Create response based on content-type
                        switch (contentType) {
                            
                            case 'text/plain':
                                res.setHeader('Content-Type', 'text/plain')
                                res.send(output)
                                break

                            case 'application/json':
                                res.setHeader('Content-Type', 'application/json')
                                res.send({
                                    'rdf' : output,
                                    'provenance' : metadata
                                })
                                break

                            default:
                                res.setHeader('Content-Type', 'text/html')
                                var paramsRender = {
                                    'generatedRDF' : output
                                }
                                res.render('rmlmapper-output', paramsRender)
                        }

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

    .get('/tokens/imgur', (req, res) => {
        const bearerToken = tokenController.getBearerToken(req)
        res.send(bearerToken)
    })
    .get('/transfer/:filename?', (req,res)=> {
        console.log("transfer/:filename?")
        var paramsRender = {
            'ACCESS_TOKEN' : tokenController.getBearerToken(req)
        }
        if(req.params.filename !== undefined) {
            paramsRender['RML_RULES_FILENAME'] = req.params.filename
            paramsRender['RML_RULES'] = rmlRulesController.readMapping(req.params.filename)
        }
        res.render('transfer', paramsRender)
    })
    .get('/download/rml/:filename?', rmlRulesController.downloadMappingToClient)

    .listen(3000)