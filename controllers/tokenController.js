/**
 * Returns provider credentials for the given provider, if present. Otherwise, returns null.
 * @param req
 * @param provider
 * @returns {} or null
 */
exports.getProviderCredentials = function (req, provider) {
    let providerCredentials = null
    if(req.session.hasOwnProperty('tokens') && req.session.tokens.hasOwnProperty(provider)){
        providerCredentials = req.session.tokens[provider]
        providerCredentials['provider'] = provider
    }

    return providerCredentials
}