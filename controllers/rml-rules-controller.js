const path = require('path')
const fs = require('fs')
const axios = require('axios')

const dirRML = path.join(path.dirname(require.main.filename),'public', 'rml')
// Metadata read from mappings-metadata.json
const mappingsMetaData = JSON.parse(fs.readFileSync(path.join(dirRML, 'mappings-metadata.json'), {'encoding' : 'utf8'}))

/**
 * Reads the mapping file for the given provider and filename.
 * @returns string or null if not existent
 */
function readMapping(provider,filename){
    const filePath = path.join(dirRML,provider, filename)

    if(fs.existsSync(filePath)){
        return fs.readFileSync(filePath, {'encoding': 'utf8'})
    }else
        return null
}

/**
 * Returns a list of providers
 * @returns {string[]}
 */
function getProviderList() {
    return Object.keys(mappingsMetaData)
}

/**
 * Returns a list of paths to the mapping files, relative to dirRML
 * @returns {string[]}
 */
function getMappingList() {
    let providers = getProviderList()
    let relativePaths = providers.flatMap(p => {
        let providerMappingsMeta = Array.from(mappingsMetaData[p])
        return providerMappingsMeta.map(meta => path.join(p, meta.filename))
    })
    return relativePaths
}

/**
 * Returns a key-value object with providers as keys and a list of metadata records as value.
 * @returns {{[provider: string]: [{}]}}
 */
function getMappingsWithMetadata() {
    // Adds relativeFilepath to every mapping's metadata
    const entries = Object.keys(mappingsMetaData).map(
        p =>
            [p,
                mappingsMetaData[p].map(mappingMeta => {
                mappingMeta['relativeFilepath'] = `${p}/${mappingMeta.filename}`
                return mappingMeta
                })
            ])
    return Object.fromEntries(entries)
}

/**
 * Creates response for downloading the mapping specified in the request (req).
 * @param req
 * @param res
 */
function downloadMappingToClient(req, res) {
    const provider = req.params.provider
    const filename = req.params.filename

    // Both provider & filename parameter should be defined, otherwise: complain!
    if(provider!==undefined && filename!==undefined){
        // Read the mapping
        const mapping = readMapping(provider, filename)
        if(mapping !== null) {
            // Make it downloadable for the client
            res.setHeader('Content-Length', mapping.length)
            res.write(mapping, 'binary')
        }else {
            console.error("Can't find mapping...")
            // 404: Not Found
            res.sendStatus(404)
        }
    }else {
        // https://softwareengineering.stackexchange.com/questions/329229/should-i-return-an-http-400-bad-request-status-if-a-parameter-is-syntactically
        res.sendStatus(422)
    }
    res.end()
}

/**
 * Executes RML Mapping.
 * @param urlRMLMapper
 * @param mapping
 * @param cb
 * @param cbError
 * @returns {Promise<void>}
 */
async function executeRMLMapping(urlRMLMapper, mapping, cb, cbError) {
    console.log("@executeRMLMapping")
    try {
        // Construct the parameters used to execute the RML Mapping
        const paramsRMLMapperRequest = {
            'rml': mapping,
            'generateMetadata': true
        }

        const data = await axios.post(urlRMLMapper, paramsRMLMapperRequest)
        // Execute callback cb on result
        cb(data)

    } catch (error) {
        console.error("Error while executing RML Mapping")
        console.error("\turl RMLMapper web api: ", urlRMLMapper)
        console.error(error.message)
        cbError(error)
    }
}

// Export
exports.getProviderList = getProviderList
exports.getMappingList = getMappingList
exports.getMappingsWithMetadata = getMappingsWithMetadata
exports.readMapping = readMapping
exports.downloadMappingToClient = downloadMappingToClient
exports.getDirRML = () => {return dirRML}
exports.executeRMLMapping = executeRMLMapping
