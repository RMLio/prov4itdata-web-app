const path = require('path')
const fs = require('fs')
const axios = require('axios')

const dirRML = path.join(path.dirname(require.main.filename),'public', 'rml')

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
exports.getDirRML = () => {return dirRML}
exports.executeRMLMapping = executeRMLMapping
