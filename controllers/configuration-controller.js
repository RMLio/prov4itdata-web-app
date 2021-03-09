const fs = require('fs');
const path = require('path');

const dirConfiguration = path.join(path.dirname(require.main.filename),'public', 'configuration')
// Transfer configuration read from public/configuration/configuration.json
const configuration = JSON.parse(fs.readFileSync(path.join(dirConfiguration, 'transfer-configuration.json'), {'encoding' : 'utf8'}))

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

exports.getSolidConfiguration = function () {
    return configuration.solid;
}
