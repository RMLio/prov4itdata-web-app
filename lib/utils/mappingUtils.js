var crypto = require('crypto')


/**
 * Searches for // TODO: document
 * @param mapping
 * @param templateMapping
 * @returns {{}}
 */
exports.initializeReplacementMapping  = function (mapping, templateMapping){
    // Pattern for templates
    const regex = /\{{2}(:?.*)\}{2}/gm;
    let m;

    var replacementMapping = {}
    while ((m = regex.exec(mapping)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        let templateReplacementKey = m[0] // {{keyname}} // TODO: delete
        let templateReplacementKeyName = m[1] // keyname
        // TODO/         let templateReplacementValue = templateMapping.hasOwnProperty(templateReplacementKeyName) ? templateMapping[templateReplacementKeyName] : null
        let templateReplacementValue = templateMapping[templateReplacementKeyName]
        replacementMapping[templateReplacementKeyName] = templateReplacementValue ? templateReplacementValue : null
    }
    return replacementMapping
}


/**
 * Iterates over the key-values of the replacementMapping and
 * replaces each {{key}} in mapping with the corresponding value.
 * @param mapping: String
 * @param replacementMapping: key-value object
 * @returns mapping with replacements
 */
exports.doReplacement = function(mapping, replacementMapping)  {
    Object.entries(replacementMapping).forEach(([k,v])=>{
        // the templates in the mapping are encapsulated in double curly braces
        let replacementKey = `{{${k}}}`
        // replace the key with its value
        mapping = mapping.replace(replacementKey, v)
    })

    return mapping
}

function createNonce() {
    return crypto.randomBytes(16).toString('base64');
}
function createTimestamp() {
    return Date.now()
}

exports.createTemplateKeyValues = function(providerCredentials, providerConfig) {

    const provider = providerCredentials['provider']
    var templateKeyValues = Object.fromEntries(
        Object.entries(providerCredentials.request)
            .concat(Object.entries(providerCredentials.response))
    )



    // provider specific template key-values
    switch (provider) {

        case 'flickr':
            templateKeyValues['client_secret'] = providerConfig.secret
            templateKeyValues['client_key'] = providerConfig.key
            templateKeyValues['oauth_nonce'] = createNonce()
            templateKeyValues['oauth_timestamp'] = createTimestamp()
            break;

        case 'imgur':
            // The access_token is a Bearer
            const bearerToken = templateKeyValues['access_token']
            // The bearerToken should be filled in in the 'ex:authorizationHeader' as follows:
            templateKeyValues['authorizationHeader'] =`Bearer ${bearerToken}`
            break

        default:
            // Unknown provider --> 422: unprocessable entity
            console.error("Unknown provider: " + provider)
            res.sendStatus(422)
            return
    }
    return templateKeyValues
}
