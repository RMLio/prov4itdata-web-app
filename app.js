
var express = require('express')
var session = require('express-session')
var Grant = require('grant').express()
var grant = Grant(require('./config.json'))
const axios = require('axios')
const {response} = require('express')
var fs = require('fs')
var path = require('path');
var https = require('https')
var pem = require('pem')


// controllers
var rmlRulesController = require('./controllers/rmlRulesController')
var tokenController = require('./controllers/tokenController')

// utils
var mappingUtils = require('./lib/utils/mappingUtils')

// Configuration constants
const PORT = 3000

// TODO: refactor helper functions

function updateTokens(req) {
    console.log('@updateTokens')
    var g = req.session.grant

    if(g===null)
        return
    // if tokens object doesn't exist yet, initialize!
    if(!req.session.tokens)
        req.session.tokens = {}

    // Fill in request & response keys (if there's a key missing, initialize an empty kev-value object)
    req.session.tokens[g.provider] = {
        'request' : g.request ? g.request : {},
        'response' : g.response ? g.response : {}
    }

}

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





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var app = express()
app.set('view engine', 'pug')
    .use(session(
        {secret: 'grant',
            saveUninitialized: true,
            resave: false,

        }))
    .use(grant)
    // client-side Solid auth
    .use('/solid-auth', express.static(path.join(__dirname, 'solid-auth')))

    .get('/', (req,res)=>{

        // DEBUG
        console.log("provider list: " ,       rmlRulesController.getProviderList()
        )

        // Create key-value pairs for each RML Mapping file
        const mappingList = rmlRulesController.getMappingList();
        console.log("mappinglsit: ", mappingList)
        var downloadRoutes = rmlRulesController.getMappingList()
            .flatMap((f)=>[{
            'text':f, 'href':path.join('/download/rml', f)
        }])





        // Create key-value pairs for the routes to pages
        const authRoutes = [
            {'text': 'Connect Imgur', 'href':'/connect/imgur'},
            {'text': 'Connect Flickr', 'href':'/connect/flickr'},
            {'text': 'Solid Authentication', 'href':'/solid-auth'},
        ]
        // Create key-value pairs for the routes to test GET requests to the services (e.g. Imgur)
        const serviceGetRoutes = [
            {'text': 'Imgur: GET my images', 'href':'/get/imgur'},
        ]

        // Create key-value pairs for routes for executing RML Rules
        const executeMappingRoutes = rmlRulesController.getMappingList()
            .flatMap((f)=>[{'text':f, 'href':path.join('/rmlmapper', f)}])

        // Create key-value pairs for routes for executing the transfer pipeline
        const transferRoutes = rmlRulesController.getMappingList()
            .flatMap((f)=>[{'text':f, 'href':path.join('/transfer', f)}])

        // Dev routes
        const devRoutes = [
            {'text' : 'flickr provider, no file', 'href' : '/rmlmapper/flickr'},
            {'text' : 'flickr provider, flickr-001-TEMPLATED.ttl', 'href' : '/rmlmapper/flickr/flickr-001-TEMPLATED.ttl'}
        ]

        // Construct render parameters
        var paramsRender = {
            'tokens' : req.session.tokens? Object.keys(req.session.tokens) : null,
            'downloadRoutes' : downloadRoutes,
            'authRoutes': authRoutes,
            'serviceGetRoutes' : serviceGetRoutes,
            'executeMappingRoutes' : executeMappingRoutes,
            'transferRoutes' : transferRoutes,
            'devRoutes' : devRoutes
        }
        // Render
        res.render('index', paramsRender)
    })
    /**
     * TODO: delete this /v1
     */
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
        rmlRulesController.getMappingList().forEach(
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
        console.log(req.route.path)
        updateTokens(req)
        res.redirect('/')
    })
    .get('/flickr/callback', (req, res) => {

        console.log(req.route.path)
        updateTokens(req)
        res.redirect('/')
    })

    .get('/get/imgur', (req, res) => {
        // url for GET request (should return a collection images for the logged in profile)
        const url = 'https://api.imgur.com/3/account/me/images'
        const provider = 'imgur'
        const providerTokens = tokenController.getProviderCredentials(req, provider)
        if(providerTokens){
            let bearerToken = providerTokens['response']['access_token']
            if(bearerToken)
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
            else
            {
                console.error(`Obtained providerTokens for ${provider}, but the access_token is null!`)
                res.sendStatus(500) // Internal server error?
            }
        }else
            res.sendStatus(401) // 401: Unauthorized


    })
    .get('/rml/rules/:filename?', (req, res)=> {
        console.log("/rml/rules/:filename")
        const filename = req.params.filename
        // When the filename parameter is not provided, return the available mapping files
        if(filename === undefined){
            res.send(rmlRulesController.getMappingList())
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

    .get('/rmlmapper/:provider/:filename?', (req, res) => {
        const provider = req.params.provider
        const filename = req.params.filename
        if(provider && filename){
            console.log("We got both a provider & filename, we're good to go")
            console.log("provider: " + provider, ", filename: " , filename)
            // Check whether provider tokens are available
            const providerCredentials = tokenController.getProviderCredentials(req, provider)
            // Grant config
            const providerConfig = grant.config[provider]

            if(providerCredentials){
                const templateKeyValues = mappingUtils.createTemplateKeyValues(providerCredentials, providerConfig)
                let mapping = rmlRulesController.readMapping(provider, filename)
                const replacementMapping = mappingUtils.initializeReplacementMapping(mapping, templateKeyValues)
                mapping = mappingUtils.doReplacement(mapping, replacementMapping)

                // TODO: refactor this to some controller
                executeRMLMapping(mapping,
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

            }else {
                // No tokens for the current provider available. Complain!
                let errMessage = `No tokens available for ${provider} available. Make sure to connect & authorize first!`
                console.error(errMessage)
                const html = `
                  <p style="color:red">${errMessage}</p><br>
                  <a href="/">Go back</a>
                `
                res.send(html)
            }

        }else {
            console.error("Missing provider and/or filename")
            // 422: unprocessable entity.
            // ref: https://stackoverflow.com/questions/3050518/what-http-status-response-code-should-i-use-if-the-request-is-missing-a-required
            res.sendStatus(422)
        }
    })

    .get('/tokens/imgur', (req, res) => {
        const bearerToken = tokenController.getBearerToken(req)
        res.send(bearerToken)
    })
    .get('/transfer/:provider/:filename', (req,res)=> {

        const provider = req.params.provider
        const filename = req.params.filename
        if(provider && filename){
            console.log("We got both a provider & filename, we're good to go")
            console.log("provider: " + provider, ", filename: " , filename)


            var paramsRender = {
                'PROVIDER' : provider,
                'ACCESS_TOKEN' : tokenController.getBearerToken(req)
            }
            if(req.params.filename !== undefined) {
                paramsRender['RML_RULES_FILENAME'] = req.params.filename
                paramsRender['RML_RULES'] = rmlRulesController.readMapping(provider, req.params.filename)
            }
            res.render('transfer', paramsRender)
        }else {

        }

    })
    .get('/download/rml/:provider/:filename', rmlRulesController.downloadMappingToClient)

pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
    console.log("create cert")
    if (err) {
        throw err
    }


    https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app).listen(PORT)
})
