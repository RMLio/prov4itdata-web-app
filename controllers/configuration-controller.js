const configuration = {
    'imgur' : {
        'solid' : {
            'filename': 'imgur.ttl'
        },
        'connect' : '/connect/imgur'


    },
    'flickr' : {
        'solid' : {
            'filename': 'flickr.ttl'
        },
        'connect' : '/connect/flickr'
    },
    'solid' : {
        'podUrl' : 'https://dapsi-client.solidcommunity.net',
        'storageDirectory' : 'private'
    }

}

exports.getAvailableProviders = function (){
    return Object.keys(configuration)
}

exports.getSolidFilenameForProvider = function (provider) {
    if(configuration.hasOwnProperty(provider))
        return configuration[provider].solid.filename
    return null
}

exports.getSolidConfigurationForProvider = function (provider) {
    let solidConfig = {}

    if(configuration.hasOwnProperty(provider)){
        solidConfig['targetUrl']= [configuration.solid.podUrl,configuration.solid.storageDirectory,
            configuration[provider].solid.filename].join('/').toString()
        solidConfig['filename'] = configuration[provider].solid.filename
        solidConfig['podUrl'] = configuration.solid.podUrl
        solidConfig['storageDirectory'] = configuration.solid.storageDirectory
    }
    return solidConfig
}

exports.getConnectionUrlForProvider = function (provider) {
    if(configuration.hasOwnProperty(provider))
        return configuration[provider].connect
    return null
}

