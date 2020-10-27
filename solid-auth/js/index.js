// Identity provider
const idp = 'https://solidcommunity.net'
// Namespaces
var namespaces = new Map()
namespaces.set('ex', 'http://www.example.org/rdf#')

solid.auth.trackSession(session => {
    if (!session)
        console.log('The user is not logged in')
    else
        document.getElementById("solid_username").innerHTML = session.webId

})

/**
 * 
 * @param {idp}: Identity Provider 
 */
async function login(idp) {
    const session = await solid.auth.currentSession();
    if (!session)
        await solid.auth.login(idp);
    else {
        document.getElementById("solid_username").innerHTML = session.webId
    }
}


/**
 * Helper: update the inner HTML of document elements given a map
 * @param {idOnInnerHTML}: key-values object (id DOM element -> inner HTML data)
 */
function setInnerHTMLByElementIdMap(idOnInnerHTML) {
    for (let [key, value] of Object.entries(idOnInnerHTML)) {
        document.getElementById(key).innerHTML = value
    }
}


/**
 * Fetch sample data from the Solid pod
 * @param {url}: url to Solid resource to be fetched 
 */
async function fetchFromSolidPod(url) {
    // Wait for the response
    const response = await solid.auth.fetch(url)

    // Set up a StreamReader and UTF8 decoder
    const reader = response.body.getReader()
    const utf8Decoder = new TextDecoder("utf-8")

    // Read, decode, repeat
    var { done, value } = await reader.read()
    var decodedData = utf8Decoder.decode(value)
    console.log("decodedData: ", decodedData)
    // TODO: while(!done)-loop ?

    // Return decoded data
    return decodedData
}


// Solid: Log in
document.getElementById("btn_login").onclick = () => {
    console.log("clicked on: btn_login")
    login(idp)
}

// Solid: Log out
document.getElementById("btn_logout").onclick = () => {
    console.log("clicked on: btn_logout")
    solid.auth.logout().then(() => alert("Logged out!"))
}

// Solid: Fetch data from Solid pod
document.getElementById("btn_fetch_sample").onclick = async function () {
    url = 'https://dapsi-client.solidcommunity.net/private/friends.ttl'

    // Create key value pairs (keys: HTML element IDs; values: inner HTML data)
    const idOnData = {
        'code_block': await fetchFromSolidPod(url), // blocking; wait for this to finish
        'data_sample_url': url
    }
    setInnerHTMLByElementIdMap(idOnData)
}

// Solid: Create sample data
document.getElementById("btn_create_data").onclick = async function () {
    console.log("clicked on: btn_create_data")

    // Url to the sandbox.ttl file
    url = 'https://dapsi-client.solidcommunity.net/private/sandbox.ttl'
    
    // Insert query
    const query = `INSERT DATA {
        <${namespaces.get('ex')}sample> <${namespaces.get('ex')}createdAt> "${(new Date()).toLocaleString()}" .
    }`

    // Construct request parameters 
    const params = {
        method : 'PATCH',
        body : query,
        headers : {
            'Content-Type': 'application/sparql-update'
        }
    }
    // Execute request & await result
    const response = await solid.auth.fetch(url, params)

    if([200, 201].includes(response.status)) { 
        console.log(response)
    }else {
        console.error(response)
    }
}

// Solid: Fetch created timestamps from Solid pod
document.getElementById("btn_fetch_sandbox").onclick = async function () {
    url = 'https://dapsi-client.solidcommunity.net/private/sandbox.ttl'

    // Create key value pairs (keys: HTML element IDs; values: inner HTML data)
    const idOnData = {
        'sandbox_data': await fetchFromSolidPod(url), // blocking; wait for this to finish
        'sandbox_url': url
    }
    setInnerHTMLByElementIdMap(idOnData)
}