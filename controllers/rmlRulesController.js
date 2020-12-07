var path = require('path')
var fs = require('fs')
var glob = require('glob')
const dirRML = path.join(path.dirname(require.main.filename), 'rml')
const GLOB_PATTERN_GET_MAPPINGLIST = `${dirRML}/*/*.ttl`
const mappingsMetaData = JSON.parse(fs.readFileSync(path.join(dirRML, 'mappings-metadata.json'), {'encoding' : 'utf8'}))
/**
 * TODO: document
 * @returns {string[]}: .ttl files
 */
function readMapping(provider,filename){
    const filePath = path.join(dirRML,provider, filename)

    if(fs.existsSync(filePath)){
        return fs.readFileSync(filePath, {'encoding': 'utf8'})
    }else
        return null
}

/**
 * TODO: document
 * @returns {string[]}
 */
function getProviderList() {
    // TODO: change to return Object.keys(mappingsMetaData)
    return fs.readdirSync(dirRML, {'encoding': 'utf8'})
}

/**
 * TODO: document
 * @returns {*}
 */
function getMappingList() {
    let providers = Object.keys(mappingsMetaData)
    let relativePaths = providers.flatMap(p => {
        let providerMappingsMeta = Array.from(mappingsMetaData[p])
        return providerMappingsMeta.map(meta => path.join(p, meta.filename))
    })
    return relativePaths
}

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
 * TODO: document
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

// Export
exports.getProviderList = getProviderList
exports.getMappingList = getMappingList
exports.getMappingsWithMetadata = getMappingsWithMetadata
exports.readMapping = readMapping
exports.downloadMappingToClient = downloadMappingToClient
exports.getDirRML = () => {return dirRML}