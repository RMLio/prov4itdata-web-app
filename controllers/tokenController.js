exports.getBearerToken = function(req) {
    if (req.session.hasOwnProperty('grant') && req.session.grant.hasOwnProperty('response'))
        // get the bearer token from session
        return req.session.grant.response['access_token']
    return null
}