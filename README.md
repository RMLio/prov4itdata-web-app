# README

## Setup: RMLMapper Web API

For some of the use cases defined below, the **RMLMapper Web API** needs to be running.

The **RMLMapper Web API** must be set up using a specific version of the RMLMapper.
 You can find the corresponding JAR [here](https://www.dropbox.com/s/tjj0eixoyekccpg/rmlmapper-4.9.0-r325-WebApiSupport.jar?dl=0"),
 or you can download it from the commandline as follows:

 ```bash
curl -L https://cloud.ilabt.imec.be/index.php/s/sGqqBNWYFBJ6iLA/download --output rmlmapper.jar
```

Assuming you have the downloaded the JAR to the current directory, you can run the **RMLMapper Web API** using this JAR as follows

```bash
rmlmapper-webapi -r rmlmapper.jar
```

By default, this will serve the **RMLMapper Web API** at `http://localhost:4000/`.

## Setup: web-app

You can configure the environment using the `app-config.json` file:

- To run the web-app locally, set the `environment` value to `dev`. Don't forget to specify the url of the RMLMapper Web API using the `rmlmapper_webapi` property.
- To run the web-app on the testbed, set the `environment` value to `testbed`. Don't forget to specify the url of the RMLMapper Web API using the `rmlmapper_webapi` property.

Each `app-config` refers to a json file (template at `config.template.json`) that contains all credentials. Check the respective Data Provider APIs as to how to specify all credentials.

Run the web-app using:

```bash
yarn run start
```

Run the web-app in development mode using:

```bash
yarn run start:dev
```

### Adding data providers

#### [Google People API](https://developers.google.com/people?hl=en)

Prerequisites:
- Google Developer Account

- Go to the [Google Developer Console](https://console.developers.google.com/)
   and the first thing to do, is creating a project. In this example, the project was named `PROV4ITDaTa-DAPSI`
- For any further steps, make sure the project you created in the previous step is active. This is shown at the top of the console, as depicted by the following figure.
   
![Make sure that the correct project is selected](docs/img/readme-adding-google-step001-selected-project.png)

- Navigate to *APIs & Services*  

![Go to APIs and Services](docs/img/readme-adding-google-navigate-to-APIs-and-Services.png)

- Search and enable the API you wish to integrate. In this case, the [Google People API](https://console.cloud.google.com/apis/library/people.googleapis.com)

- In order to make requests to the API, you need to set up authorization.
    - Since we need to access private data, OAuth 2.0 credentials must be generated.
    - Go to the [Credentials page](https://console.developers.google.com/apis/credentials) and click on *Create Credentials* and select *OAuth client ID*
    </br>![Create credentials and select OAuth client ID ](docs/img/readme-adding-google-authorization-create-credentials-dropdown.png)

    - Set the *Application Type* to *Web Application*, enter a name, and add authorization redirect URI(s) pointing back to your web-app server
    



 - OAuth 2.0 Client
  - added nearly all scopes w.r.t. reading from people API
  - [ ] **can this be easily extended to other Google apis?**
  - add testusers (in test-mode, only testusers can use the app (you can register up to 100 test users))
  - create credentials
   - API Key: `AIzaSyDNwWIFFpiOmAFiygS7eM-xcltFEWYIthk`
   - Oauth Client
    - name: `oauthclient-dapsi-dev`
    - client id: `704703996998-mm0psiamc628soisd9hkovrjo5tlbd2q.apps.googleusercontent.com`
    - client secret: `tatxC9Eli-VWJ5-i12IpSiST`

## Use cases

### Use case: Transfer data

1. Navigate to the web-app (depends on the configuration in `app-config.json`).
2. If you aren't already logged in to your Solid pod, you will be redirected to the login page.
3. The web-app's home page will show a dropdown menu where you can select a mapping to be executed.
When selecting a mapping, it will be shown in the RML Rules card. Click the card to expand/collapse.
4. When clicking "Execute", the generated output and provenance will available in the "Generated RDF" and "Provenance" cards respectively.
The generated output will be stored on the Solid pod.
5. You can download the RML rules, generated output, and provenance using the corresponding "Download"-button in each card.
6. Verify what is stored on the Solid pod using the controls in the Solid-card. It is also possible to delete the file afterwards.
