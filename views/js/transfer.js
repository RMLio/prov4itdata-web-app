// Identity provider
const idp = 'https://solidcommunity.net'
var generatedRDF = null

window.onload = function(loadEvent) {

    solid.auth.trackSession(session => {
        if (!session)
            login(idp)
        else {
            document.getElementById("solid_username").innerHTML = session.webId
        }

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

    /**
     * Stores the generated RDF on the Solid Pod
     * @returns {Promise<void>}
     */
    async function storeGeneratedRDFOnSolidPod() {
        console.log("@storeGeneratedRDFOnSolidPod")
        // Url to the sandbox.ttl file
        url = 'https://dapsi-client.solidcommunity.net/private/imgur.ttl'

        // Insert query
        const query = `INSERT DATA {${generatedRDF}}`

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
            alert("Succesfully stored on Solid Pod")
        }else {
            console.error(response)
            console.error("params: ", params)
            alert("Can't store RDF data on Solid Pod...")
        }
    }

    // Log in to Solid
    document.getElementById("btn_auth_solid").onclick = async function () {
        console.log("clicked btn_auth_solid")
        login(idp)
    }

    // Execute RML Mapping
    document.getElementById("btn_execute_mapping").onclick = async function () {
        console.log("clicked btn_execute_mapping")
        // Retrieving the filename of the selected mapping from the code_filename_rml_mapping-element
        const filenameMapping = document.getElementById('code_filename_rml_mapping').innerText

        // Create url for calling the rmlmapper using this mapping file
        const url = `/rmlmapper/${filenameMapping}`

        // Execute & process response
        const response = await fetch(url)
        if (response.status == 200) {
            // Set up a StreamReader and UTF8 decoder
            const reader = response.body.getReader()
            const utf8Decoder = new TextDecoder("utf-8")

            // Read, decode, repeat
            var {done, value} = await reader.read()
            generatedRDF = utf8Decoder.decode(value)

            // Display it on the HTML page
            document.getElementById("pre_output").innerText = generatedRDF

        }
    }

    // Fetch data from Solid pod and render it on the web page
    document.getElementById("btn_fetch_from_solid").onclick = async function () {
        url = 'https://dapsi-client.solidcommunity.net/private/imgur.ttl'

        const solidPodData = await fetchFromSolidPod(url)
        document.getElementById("pre_solidpod_data").innerText = solidPodData
    }

    // Store generated RDF on Solid Pod
    document.getElementById("btn_post_to_solid").onclick = async function () {
        console.log("clicked btn_post_to_solid")

        if(generatedRDF != null)
            await storeGeneratedRDFOnSolidPod()
        else
            alert("There's no generated RDF data.")

    }
}