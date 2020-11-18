// TODO: still needed? Delete if not.
exports.getBearerToken = function(req) {
    if (req.session.hasOwnProperty('grant') && req.session.grant.hasOwnProperty('response'))
        // get the bearer token from session
        return req.session.grant.response['access_token']
    return null
}

exports.getProviderCredentials = function (req, provider) {
    // If provider is present, return tokens object, otherwise null
    if(req.session.hasOwnProperty('tokens') && req.session.tokens.hasOwnProperty(provider)){
        let providerCredentials = req.session.tokens[provider]
        providerCredentials['provider'] = provider
        return providerCredentials
    }
    else
        return null
}