const express = require('express')
const router = express.Router();
const rmlRulesController = require('../controllers/rml-rules-controller')
const tokenController = require('../controllers/token-controller')
const mappingUtils = require('../lib/utils/mapping-utils')
const configurationController = require('../controllers/configuration-controller')

const YAML = require('yamljs');
const swaggerDocs = YAML.load('./swagger.yaml')
const swaggerUi = require('swagger-ui-express')


const statusCodes = {
    401: "Unauthorized",
    404: "Not Found",
    415: "Unsupported Media Type",
    422: "Unprocessable Entity",
    500: "Internal Server Error"
}

function createRouter(grant, environmentConfig, logConfig = null) {
    if (logConfig) {
        if (logConfig.logConfig.logRoute)
            // Writes the current route to the console
            router.use((req, res, next) => {
                console.log(`route: ${req.path}`)
                next()
            })
    }

    // SWAGGER
    router.use('/api-docs', swaggerUi.serve)
    router.get('/api-docs', swaggerUi.setup(swaggerDocs))

    // callback for capturing the img tokens
    router.get('/imgur/callback', (req, res) => {
        console.log(req.route.path)
        updateTokens(req)
        res.redirect('/')
    })

    // callback for capturing the flickr tokens
    router.get('/flickr/callback', (req, res) => {
        console.log(req.route.path)
        updateTokens(req)
        res.redirect('/')
    })

    // callback for capturing the Google tokens
    router.get('/google/callback', (req, res) => {
        console.log(req.route.path)
        updateTokens(req)
        res.redirect('/')
    })

    /**
     * Return RML Rules
     * If a filename is specified, read and send that file.
     * Otherwise, return a list of available mappings.
     */
    router.get('/rml/rules/:provider/:filename?', (req, res) => {
        const provider = req.params.provider
        const filename = req.params.filename
        // When the filename parameter is not provided, return the available mapping files
        if (provider === undefined || filename === undefined) {
            res.send(rmlRulesController.getMappingList())
        }
        // If the filename parameter is defined, return the file it points to, if it exists.
        else {
            const mapping = rmlRulesController.readMapping(provider, filename)
            if (mapping != null)
                res.send(mapping)
            else
                handleStatusCode(req, res, 404)
        }
    })

    /**
     * Execute the RMLMapper with a specific mapping for a specific provider
     * provider: e.g. flickr, imgur
     * filename: filename of the mapping
     *
     * The return-value depends on the content-type
     */
    router.get('/rmlmapper/:provider/:filename', (req, res) => {
        const provider = req.params.provider
        const filename = req.params.filename
        if (provider && filename) {
            console.log("We got both a provider & filename, we're good to go")
            console.log("provider: " + provider, ", filename: ", filename)
            // Check whether provider tokens are available
            const providerCredentials = tokenController.getProviderCredentials(req, provider)
            // Grant config
            const providerConfig = grant.config[provider]

            if (providerCredentials) {
                const templateKeyValues = mappingUtils.createTemplateKeyValues(providerCredentials, providerConfig)
                let mapping = rmlRulesController.readMapping(provider, filename)
                const replacementMapping = mappingUtils.initializeReplacementMapping(mapping, templateKeyValues)
                mapping = mappingUtils.doReplacement(mapping, replacementMapping)

                // TODO: refactor this to some controller
                rmlRulesController.executeRMLMapping(environmentConfig.rmlmapper_webapi, mapping,
                    // Process the reponse
                    (response) => {
                        // If succesful, output the generated RDF as plain text
                        if (response.status == 200) {
                            const output = response.data.output
                            const metadata = response.data.metadata
                            const contentType = req.headers['content-type']

                            // Create response based on content-type
                            switch (contentType) {

                                case 'text/plain':
                                    res.setHeader('Content-Type', 'text/plain')
                                    res.send(output)
                                    break


                                case 'application/json':
                                default:
                                    res.setHeader('Content-Type', 'application/json')
                                    res.send({
                                        'rdf': output,
                                        'prov': metadata
                                    })


                            }

                        } else {
                            // Complain
                            console.error("Unsuccessful...")
                            console.error(response)
                            res.send(`<p style="color:red">FAILURE</p>`)
                        }
                    },
                    (error) => {
                        handleStatusCode(req,res,500, error.toString())
                    }
                )

            } else {
                // No tokens for the current provider available. Complain!
                let errMessage = `No tokens available for ${provider} available. Make sure to connect & authorize first!`
                handleStatusCode(req, res, 401, errMessage)
            }

        } else {
            console.error()
            // 422: unprocessable entity.
            handleStatusCode(req, res, 422, "Missing provider and/or filename")
        }
    })

    /**
     * Route for downloading a mapping, given the provider & filename of the mapping
     */
    router.get('/download/rml/:provider/:filename', rmlRulesController.downloadMappingToClient)

    /**
     * TODO: document
     */
    router.get('/status/:provider/connected', (req,res)=>{
        const provider = req.params.provider
        let responseObject = {
            'provider' : provider,
            'connected' : false
        }
        // If there are credentials for the given provider, we consider it connected
        if(tokenController.getProviderCredentials(req,provider)!==null)
            responseObject.connected = true

        res.send(responseObject)
    })

    /**
     * Routes for getting the configurations
     */
    router.get('/configuration/:provider/:configKey', (req,res)=>{
        const provider = req.params.provider
        const configKey = req.params.configKey
        if(provider){
            switch (configKey) {
                case 'solid':
                    // TODO: send solid configuration
                    let solidConfig = configurationController.getSolidConfigurationForProvider(provider)
                    console.log("solidConfig: " , solidConfig)
                    res.send(solidConfig)
                    break
                case 'connect':
                    let connectionUrl = configurationController.getConnectionUrlForProvider(provider)
                    res.send({url: connectionUrl})
                    break
                default:
                    handleStatusCode(req,res, 422, "Invalid configuration key")

            }
        }else {
            handleStatusCode(req,res, 422, "Provider should not be null")
        }
    })

    /**
     * Log out
     */
    router.post('/logout', (req, res) => {
        let statusCode = 200
        let body = { success : true }
        try {
            // Destroy the session
            req.session.destroy()
        } catch (e) {
            console.error('Error while trying to destroy the session')
            statusCode = 500
            body =  {...body, success: false}
        }
        finally {
            res.format({
                'application/json': () => res.status(statusCode).json(body)
            })
        }
    })

    return router
}

function updateTokens(req) {
    console.log('@updateTokens')
    var g = req.session.grant

    if (g === null)
        return
    // if tokens object doesn't exist yet, initialize!
    if (!req.session.tokens)
        req.session.tokens = {}

    // Fill in request & response keys (if there's a key missing, initialize an empty kev-value object)
    req.session.tokens[g.provider] = {
        'request': g.request ? g.request : {},
        'response': g.response ? g.response : {}
    }
}



function handleStatusCode(req, res, code, optionalMessage = "") {
    console.error(`${req.path}\tSTATUS: ${code}\t${statusCodes[code]}\n${optionalMessage}`)
    res.sendStatus(code)
}

module.exports = createRouter
