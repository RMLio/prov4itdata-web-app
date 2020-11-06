var path = require('path')
var fs = require('fs')
const dirRMLRules = path.join(path.dirname(require.main.filename), 'rml')

/**
 *
 * @returns {string[]}: .ttl files
 */

function readMapping(filename){
    const filePath = path.join(dirRMLRules, filename)

    if(fs.existsSync(filePath)){
        return fs.readFileSync(filePath, {'encoding': 'utf8'})
    }else
        return null
}
exports.mappingList = function () {
    return fs.readdirSync(dirRMLRules, {encoding:'utf8'})
        .filter((value, index, array)=>{return path.extname(value) === '.ttl'})
}

exports.readMapping = readMapping

exports.downloadMappingToClient = function(req,res) {
    const filename = req.params.filename
    if(filename!==undefined){
        // Read the mapping
        const mapping = readMapping(filename)
        if(mapping !== null) {
            // Make it downloadable for the client
            res.setHeader('Content-Length', mapping.length)
            res.write(mapping, 'binary')
        }else {
            // 404: Not Found
            res.sendStatus(404)
        }
    }else {
        // https://softwareengineering.stackexchange.com/questions/329229/should-i-return-an-http-400-bad-request-status-if-a-parameter-is-syntactically
        res.sendStatus(422)
    }
    res.end()

}