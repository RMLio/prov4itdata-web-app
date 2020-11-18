// Identity provider
const idp = 'https://solidcommunity.net'
var generatedRDF = null
var provenance = null

const urlDirPrivate = 'https://dapsi-client.solidcommunity.net/private/'
var provider = null
var dataFileName = null

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////// HELPERS
function handleReponse(response, cbOnSuccess, cbOnFailure){
    if([200, 201].includes(response.status)) {
        cbOnSuccess(response)
    }else {
        cbOnFailure(response)
    }
}


/**
 * Reads & decodes (UTF8) the response body
 * @param response
 * @returns {Promise<string>}
 */
async function readAndDecodeBody(response) {
    // Set up a StreamReader and UTF8 decoder
    const reader = response.body.getReader()
    const utf8Decoder = new TextDecoder("utf-8")

    // Read, decode, repeat
    var { done, value } = await reader.read()
    var decodedData = utf8Decoder.decode(value)

    // Return decoded data
    return decodedData
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////// ON LOAD
window.onload = function(loadEvent) {

    // Get provider
    provider = document.getElementById('code_provider').innerText
    // Filename of the corresponding turtle file on the Solid pod
    dataFileName = `${provider}.ttl`

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
        // Return decoded data
        return readAndDecodeBody(response)
    }

    /**
     * Stores the generated RDF on the Solid Pod
     * @returns {Promise<void>}
     */
    async function storeGeneratedRDFOnSolidPod(url, data) {
        // Insert query
        const query = `INSERT DATA {${data}}`

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
        handleReponse(response,
            (res)=>alert("Succesfully stored on Solid Pod"),
            (res)=>{
                // Callback: failure
                console.error(response)
                console.error("params: ", params)
                alert("Can't store RDF data on Solid Pod...")
            }
        )

    }

    // Log in to Solid
    document.getElementById("btn_auth_solid").onclick = async function () {
        login(idp)
    }

    // Execute RML Mapping
    document.getElementById("btn_execute_mapping").onclick = async function () {
        console.log("clicked btn_execute_mapping")
        // Retrieving the filename of the selected mapping from the code_filename_rml_mapping-element
        const filenameMapping = document.getElementById('code_filename_rml_mapping').innerText
        const provider = document.getElementById('code_provider').innerText
        // Create url for calling the rmlmapper using this mapping file
        const url = `/rmlmapper/${provider}/${filenameMapping}`

        // Create request parameters
        const params = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        // Execute & process response
        const response = await fetch(url, params)
        handleReponse(response,
            async (res)=>{
                // Callback: success
                // Extract, read & decode body from response
                let data = await readAndDecodeBody(response)
                // Parse to JSON
                data = JSON.parse(data)
                
                // Initialize global variables with the new resulting data
                generatedRDF = data.rdf
                provenance = data.provenance

                // Display it on the HTML page
                document.getElementById("pre_output").innerText = generatedRDF
                document.getElementById("pre_provenance").innerText = provenance
            },
            (res)=>{
                // Callback: failure
                alert("Error while executing mapping")
                console.error("Error while executing mapping")
                console.error(res)

            })

    }

    /**
     * Creates temporary hyperlink for downloading the given data as a file
     * @param filename
     * @param data
     */
    function executeClientDownload(filename, data) {
        // Let the client download the provenance
        const a = document.createElement('a')
        const file = new Blob([data], {type: 'plain/text'})
        a.href = URL.createObjectURL(file)
        a.download = filename
        a.click()
        // release the object URL again
        URL.revokeObjectURL(a.href)
    }

    // Download RML Rules
    document.getElementById("btn_download_RML_rules").onclick = function () {
        const rmlRules = document.getElementById("pre_rules").innerText
        if(rmlRules==null)
            alert('No RDF Rules available!')
        else
            executeClientDownload("mapping.ttl", rmlRules)

    }

    // Download generated RDF
    document.getElementById("btn_download_RDF").onclick = function () {
        if(generatedRDF==null)
            alert('No RDF data available. Make sure to execute the RML Mapping first!')
        else
            executeClientDownload("output.ttl", generatedRDF)

    }

    // Download provenance
    document.getElementById("btn_download_provenance").onclick = function () {
        if(provenance==null)
            alert('No provenance data available. Make sure to execute the RML Mapping first!')
        else
            executeClientDownload("provenance.ttl", provenance)
    }

    // Fetch data from Solid pod and render it on the web page
    document.getElementById("btn_fetch_from_solid").onclick = async function () {
        let url =  new URL(dataFileName, urlDirPrivate).toString()

        const solidPodData = await fetchFromSolidPod(url)
        document.getElementById("pre_solidpod_data").innerText = solidPodData
    }

    // Store generated RDF on Solid Pod
    document.getElementById("btn_post_to_solid").onclick = async function () {
        let url =  new URL(dataFileName, urlDirPrivate).toString()

        if(generatedRDF != null)
            await storeGeneratedRDFOnSolidPod(url, generatedRDF)
        else
            alert("There's no generated RDF data.")
    }

    // DELETE data file from Solid pod
    document.getElementById("btn_delete_from_solid").onclick = async function () {
        console.log("btn_delete_from_solid")
        const params = {
            'method' : 'DELETE',
        }
        let url =  new URL(dataFileName, urlDirPrivate).toString()
        const response = await solid.auth.fetch(url, params)
        await handleReponse(response,
            (res)=>{
                console.log("Succesfully DELETED file: "  + dataFileName)

            },
            async (res)=>{
                const alertMsg = `Error while deleting file: ${dataFileName}.\n
                Error message: ${await readAndDecodeBody(res)}
                `
                alert(alertMsg)
                console.error(alertMsg)

            }
        )

    }

    // CREATE data file on Solid pod
    document.getElementById("btn_create_datafile_on_solid").onclick = async function () {
        const params = {
            'method' : 'POST',
            'body' :'',
            headers : {
                'Content-Type' : 'text/turtle',
                'Link': '<http://www.w3.org/ns/ldp#Resource>; rel="type"',
                'Slug' : dataFileName
            }
        }
        const response = await solid.auth.fetch(urlDirPrivate, params)
        handleReponse(response,
            (res)=>{
                console.log("Succesfully created file: "  + dataFileName)
            },
            async (res)=>{
                    const alertMsg = `Error while creating file: ${dataFileName}.\n
                    Error message: ${await readAndDecodeBody(res)}
                    `
                    alert(alertMsg)
                    console.error(alertMsg)
            }
        )
    }
}