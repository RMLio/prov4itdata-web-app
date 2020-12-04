
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////// HELPERS
function handleReponse(response, cbOnSuccess, cbOnFailure){
    if([200, 201].includes(response.status)) {
        return cbOnSuccess(response)
    }else {
        return cbOnFailure(response)
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

async function isConnected(provider) {
    // Create url for calling the rmlmapper using this mapping file
    const url = `/status/${provider}/connected`

    console.log("status provider: url : " , url)
    // Create request parameters
    const params = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    try {
        let data = JSON.parse(await executeRequest(url, params))
        if(data.hasOwnProperty('connected'))
            return data.connected
        else {
            console.error("response data doesn't have connected property")
            return false
        }
    }catch (err) {
        console.error("Error while checking connection for provider: " , provider)
        return false
    }

}

/**
 *
 * @param url
 * @param params
 * @returns {Promise<*>}
 */
async function executeRequest(url, params = {}){
    // Execute & process response
    const response = await fetch(url, params)
    return handleReponse(response,
        async (res)=>{
            // Callback: success
            // Extract, read & decode body from response
            let data = await readAndDecodeBody(response)
            return data
        },
        (res)=>{
            // Callback: failure
            alert("Error while doing request")
            console.error(res)
            return null
        })
}

async function getConnectionUrl(provider) {
    // Create url for calling the rmlmapper using this mapping file
    const url = `/configuration/${provider}/connect`

    console.log("configuration provider connect url : " , url)
    // Create request parameters
    const params = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return await executeRequest(url, params)
}

async function getSolidConfiguration(provider) {
    if(provider){
        // Create url for calling the rmlmapper using this mapping file
        const url = `/configuration/${provider}/solid`

        console.log("configuration provider connect url : " , url)
        // Create request parameters
        const params = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        let result = await executeRequest(url, params)
        return result
    }else {
        console.error("Can't get solid configuration when provider is null!")
    }

}

async function executeMapping() {
    let provider = getProvider()
    let filenameMapping = sessionStorage.getItem('filenameMapping')

    if(provider && filenameMapping) {
        // Create url for calling the rmlmapper using this mapping file
        const url = `/rmlmapper/${provider}/${filenameMapping}`

        console.log("execute mapping: url : " , url)
        // Create request parameters
        const params = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        try {
            let data = JSON.parse(await executeRequest(url, params))
            return data
        }catch (error) {
            console.error("Error!: ", error)
            alert("Error while executing. Can you try again?")
        }
        return null

    }else {
        let errMessage = `Can't execute the RML Mapping... provider: ${provider}, filenameMapping: ${filenameMapping}`
        alert(errMessage)
        console.error(errMessage)
        return null
    }
}

function updateOutputElements() {
    // Display it on the HTML page
    document.getElementById('pre_output').innerText = sessionStorage.getItem('generatedRDF')
    document.getElementById('pre_provenance').innerText  = sessionStorage.getItem('provenance')
}

function clearElements(elements) {
    elements.forEach(el=>el.innerText = "")
}
function updateSessionWithExecutionResults(executionResult) {
    let rdf = executionResult.hasOwnProperty('rdf') ? executionResult.rdf : null
    let provenance = executionResult.hasOwnProperty('provenance') ? executionResult.provenance : null
    sessionStorage.setItem('generatedRDF', rdf)
    sessionStorage.setItem('provenance', provenance)
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
    let result = await handleReponse(response,
        (res)=> {
            return true
        },
        (res)=>{
            // Callback: failure
            console.error(response)
            console.error("params: ", params)
            return false
        }
    )
    return result
}

async function storeOnSolidPod() {
    const data = sessionStorage.getItem('generatedRDF')
    const session = await solid.auth.currentSession()
    const solidConfiguration = getSolidConfigurationFromSessionStorage()

    if(solidConfiguration && data && session){
        const podUrl = new URL(session.webId).origin
        const relativePath = [solidConfiguration.storageDirectory, solidConfiguration.filename].join('/')
        const url = new URL(relativePath, podUrl).toString()
        console.log("storing data on solid pod at ", url)
        return await storeGeneratedRDFOnSolidPod(url, data)

    }else {
        console.error("Error! Possible causes: not logged on to solid pod, solid configuration is null, generated rdf is nul")
        console.log("solidConfiguration: " , solidConfiguration)
        console.log("data to store: ", data)
        return false
    }
}

function getProvider() {
    let provider = sessionStorage.getItem('provider')
    if(provider)
        return provider
    else
        return null
}

async function connectProviderRoutine() {
    let provider = getProvider()

    if(provider) {
        let connectionUrl = await getConnectionUrl(provider)
        alert("To execute this mapping, authorization is required. Redirecting to " + provider )
        // redirect to auth page of the provider
        window.location.replace(connectionUrl)
    }else
        console.error("Can't complete provider connection routine because provider is null!")
}

async function trackProviderConnection() {
    console.log("@trackProviderConnection")
    let provider = getProvider()
    let providerIsConnected = await isConnected(provider)
    if(providerIsConnected)
        return true
    else
        await connectProviderRoutine()
}

async function isSolidConnected() {
    const session = await solid.auth.currentSession();
    if(session)
        return true
    else
        return false
}

async function trackSolidConnection() {
    console.log("@trackSolidConnection")
    let isConnected =await isSolidConnected()
    if(isConnected){
        console.log("Solid is connected")
        return true
    }else{
        console.log("Solid NOT connected. Redirecting to login!")
        let session = null
        if(confirm("It's required to login to your Solid Pod. Redirecting to Solid login.")){
            console.debug("pre-popup solid login")
            session = await popupLogin()
            console.debug("post-popup solid login")
        }

        return !!session
    }
}

async function executeMappingRoutine() {
    console.log("@executeMappingRoutine")
    console.log("\t1. execute mapping")
    let executionResult = await executeMapping()
    if(executionResult) {
        console.log("execution Result: " , executionResult)
        console.log("\t2. updateSessionWithExecutionResults")
        updateSessionWithExecutionResults(executionResult)
        console.log("\t3. store on solid pod")
        let storeOk = await storeOnSolidPod()
        if(storeOk) {
            console.log("\t4. update output elements")
            updateOutputElements()
        }else{
            console.error("Could not store on solid pod")
            return false
        }
        return true
    }else
        return false

}
async function updateSolidConfigurationInSessionStorage() {
    console.debug("@updateSolidConfigurationInSessionStorage")
    let provider = getProvider()
    let solidConfiguration = await getSolidConfiguration(provider)
    console.debug("solidConfiguraiton: ", solidConfiguration)
    sessionStorage.setItem('solidConfiguration', solidConfiguration)
}

function getSolidConfigurationFromSessionStorage() {
    console.debug("@getSolidConfigurationFromSessionStorage")
    let plainSolidConfiguration = sessionStorage.getItem('solidConfiguration')
    if(plainSolidConfiguration) {
        console.debug("plainSolidConfiguration: ", plainSolidConfiguration)
        let result = JSON.parse(plainSolidConfiguration)
        console.debug("result: ", result)
        return result
    }else {
        console.error("No Solid configuration in session storage!")
        return null
    }
}

/**
 * Fetch sample data from the Solid pod
 * @param {url}: url to Solid resource to be fetched
 */
async function fetchFromSolidPod(url) {
    console.debug("@fetchFromSolidPod. Url: ", url)
    if(await isSolidConnected()) {
        // Wait for the response
        const response = await solid.auth.fetch(url)
        return handleReponse(response,
            (res) =>  readAndDecodeBody(res),
            (res)=> {
                // failure callback
                alert("Can't fetch data from " + url + ". Message: " + response.statusText)
                return null
            }
        )
    }else {
        const errMessage = "You are not logged in to your Solid pod."
        alert(errMessage)
        console.error(errMessage)
        return null
    }
}

async function trackExecutionRoutine() {
    console.log("@trackExecutionRoutine")
    if(isSelectedMappingValid()) {
        let providerConnected =  await trackProviderConnection()
        let mappingExecuted = false
        let solidConnected = false

        if(providerConnected === true)
            solidConnected = await trackSolidConnection()
        else
            console.error("provider not connected, can't proceed to executeMappingRoutine")


        if(solidConnected === true)
            mappingExecuted = await executeMappingRoutine()
        else
            console.error("solid not connected, can't proceed to executeMappingRoutine")



        // When execution routine is finished, we can remove the trigger
        if(mappingExecuted === true) {
            sessionStorage.removeItem("executionTriggered")
            alert('Mapping executed successfully! The generated data is stored on to your Solid Pod.')
        }
        else
            console.error("mapping executed is false, can't remove executionTriggered flag!")
    }else {
        console.error("Execution stopped. Invalid mapping selection!")
    }

}

/**
 * The "Select mapping" option is at index 0, so we only update the variables when
 * the index is > 0. If the index is 0, we just clear any variables and DOM elements
 * @returns {boolean}
 */
function isSelectedMappingValid(){
    let select = document.getElementById('select_grouped_mappings')
    if(select && select.selectedIndex >0)
        return true
    else
        return false
}

async function suggestLoginToSolidPod() {
    if(confirm("You're not logged in to your Solid pod! You want to the Solid login first?"))
        await popupLogin()
}

async function popupLogin() {
    let session = await solid.auth.currentSession();
    let popupUri = 'https://solidcommunity.net/common/popup.html';
    if (!session)
        session = await solid.auth.popupLogin({ popupUri });
    if(session) {
        alert(`Logged in as ${session.webId}`);
        return session
    }
    else {
        alert("Unable to login to Solid pod")
        return null
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////// ON LOAD
window.onload = async function (loadEvent) {


    const elementIds = [
        // selects
        'select_provider',
        'select_solid_file',
        'select_grouped_mappings',
        // buttons
        'btn_execute_mapping',
        'btn_clear_outputs',
        'btn_download_RML_rules',
        'btn_download_provenance',
        'btn_download_RDF',
        // pre-elements
        'pre_rules',
        'pre_output',
        'pre_provenance'
    ]

    const outputElementIds = [
        'pre_rules',
        'pre_provenance',
        'pre_output'
    ]

    // map the ids to the DOM elements
    const elements = Object.fromEntries(elementIds.map((id) => [id, document.getElementById(id)]))
    const outputElements = Object.fromEntries(outputElementIds.map((id) => [id, document.getElementById(id)]))

    // Update select element for the RML Mapping
    let sidx = sessionStorage.getItem('selectedMappingIndex')
    if (sidx)
        elements.select_grouped_mappings.selectedIndex = sidx

    elements.btn_execute_mapping.disabled = !isSelectedMappingValid()

    // Update RML Rules element
    let rmlRules = sessionStorage.getItem('RMLRules')
    if (rmlRules)
        elements.pre_rules.innerText = sessionStorage.getItem('RMLRules')


    // Check whether an execution is triggered
    let executionTriggered = sessionStorage.getItem('executionTriggered') && sessionStorage.getItem('executionTriggered') === 'true'
    if (executionTriggered) {
        console.log("execution is triggered")
        await trackExecutionRoutine()
    }

    // Execute RML Mapping
    elements.btn_execute_mapping.onclick = async function () {
        console.log("clicked btn_execute_mapping")
        sessionStorage.setItem("executionTriggered", "true")
        await trackExecutionRoutine()
    }

    /**
     * Dropdown menu for selecting the RML Mapping to be
     * @returns {Promise<void>}
     */
    elements.select_grouped_mappings.onchange = async () => {
        console.log("select_mapping change event")
        elements.btn_execute_mapping.disabled = !isSelectedMappingValid()

        if (isSelectedMappingValid()) {
            // the currently selected index
            let sidx = elements.select_grouped_mappings.selectedIndex
            sessionStorage.setItem("selectedMappingIndex", sidx)

            // clear output elements
            clearElements(Object.values(outputElements))

            // Retrieving the filename of the selected mapping from the code_filename_rml_mapping-element
            let selectedMapping = elements.select_grouped_mappings.value
            let [p, f] = selectedMapping.split('/')

            sessionStorage.setItem("provider", p)
            sessionStorage.setItem("filenameMapping", f)
            // Create url for calling the rmlmapper using this mapping file
            const url = `/rml/rules/${sessionStorage.getItem('provider')}/${sessionStorage.getItem('filenameMapping')}`

            // Create request parameters
            const params = {}
            // Execute & process response
            const response = await fetch(url, params)
            await handleReponse(response,
                async (res) => {
                    // Callback: success
                    // Extract, read & decode body from response
                    let data = await readAndDecodeBody(response)
                    sessionStorage.setItem('RMLRules', data)
                    elements.pre_rules.innerText = sessionStorage.getItem('RMLRules')
                    await updateSolidConfigurationInSessionStorage()
                },
                (res) => {
                    // Callback: failure
                    alert("Error while fetching mapping")
                    console.error(res)
                })
        }
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
    elements.btn_download_RML_rules.onclick = function () {
        const rmlRules = sessionStorage.getItem('RMLRules')
        const filename = sessionStorage.getItem('filenameMapping') ? sessionStorage.getItem('filenameMapping') : 'mapping.ttl'
        if (rmlRules == null)
            alert('No RDF Rules available!')
        else
            executeClientDownload(filename, rmlRules)

    }

    // Download generated RDF
    elements.btn_download_RDF.onclick = function () {
        let generatedRDF = sessionStorage.getItem('generatedRDF')

        if (generatedRDF == null)
            alert('No RDF data available. Make sure to execute the RML Mapping first!')
        else
            executeClientDownload("output.ttl", generatedRDF)
    }

    // Download provenance
    elements.btn_download_provenance.onclick = function () {
        let provenance = sessionStorage.getItem('provenance')
        if (provenance == null)
            alert('No provenance data available. Make sure to execute the RML Mapping first!')
        else
            executeClientDownload("provenance.ttl", provenance)
    }

    // Solid
    function bindSolidControls() {

        // Fetch data from Solid pod and render it on the web page
        document.getElementById("btn_fetch_from_solid").onclick = async function () {
            let solidConfiguration = getSolidConfigurationFromSessionStorage()
            const session = await solid.auth.currentSession()

            if (session) {
                const podUrl = new URL(session.webId).origin
                const relativePath = [solidConfiguration.storageDirectory, solidConfiguration.filename].join('/')
                const url = new URL(relativePath, podUrl).toString()

                if (url) {
                    const solidPodData = await fetchFromSolidPod(url)
                    document.getElementById("pre_solidpod_data").innerText = solidPodData
                } else {
                    console.error("url to solid pod file is null")
                }
            } else suggestLoginToSolidPod()
        }

        //DELETE data file from Solid pod
        document.getElementById("btn_delete_from_solid").onclick = async function () {
            console.log("btn_delete_from_solid")
            let solidConfiguration = getSolidConfigurationFromSessionStorage()
            const session = await solid.auth.currentSession()

            if (session) {
                const podUrl = new URL(session.webId).origin
                const relativePath = [solidConfiguration.storageDirectory, solidConfiguration.filename].join('/')
                const url = new URL(relativePath, podUrl).toString()
                const params = {
                    'method': 'DELETE',
                }
                const response = await solid.auth.fetch(url, params)
                await handleReponse(response,
                    (res) => {
                        console.log("Succesfully DELETED file: " + solidConfiguration.filename)
                        document.getElementById("pre_solidpod_data").innerText = ""
                        alert(`Successfully deleted ${relativePath} from your Solid Pod (${podUrl})`)
                    },
                    async (res) => {
                        const alertMsg = `Error while deleting file: ${solidConfiguration.filename}.Error message: ${res.statusText}`
                        alert(alertMsg)
                        console.error(alertMsg)
                    }
                )

            } else await suggestLoginToSolidPod()
        }

        const btnLoginLogoutSolid = document.getElementById("btn_login_logout_solid")
        if (btnLoginLogoutSolid)
            updateSolidLoginLogoutButton(btnLoginLogoutSolid)


    }

    bindSolidControls()

    async function updateSolidLoginLogoutButton(btnLoginLogoutSolid) {
        if (await isSolidConnected()) {

            btnLoginLogoutSolid.innerText = "Log out from Solid pod"
            btnLoginLogoutSolid.onclick = async function () {
                console.log("the logout functionality")
                await solid.auth.logout()
                alert("You are now logged out from the Solid pod")
                await updateSolidLoginLogoutButton(btnLoginLogoutSolid)
            }
        } else {
            btnLoginLogoutSolid.innerText = "Log in to Solid pod"
            btnLoginLogoutSolid.onclick = async function () {
                await popupLogin()
            }
        }

    }


}