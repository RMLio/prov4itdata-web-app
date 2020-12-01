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
        solidConfig['filename'] = configuration[provider].solid.filename
        solidConfig['storageDirectory'] = configuration.solid.storageDirectory
    }
    return solidConfig
}

exports.getConnectionUrlForProvider = function (provider) {
    if(configuration.hasOwnProperty(provider))
        return configuration[provider].connect
    return null
}

