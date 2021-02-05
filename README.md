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

Install the web-app as follows:
```bash
yarn install
```

Note: the ui dependency is pulled from our private GitLab server. So you'll need the appropriate access rights.
Once the installation is completed, it's still required to run the script that builds the ui and moves it 
to the `build/ui` directory. This can be done as follows:

```bash
yarn run ui:all
```

Run the web-app using:

```bash
yarn run start
```

Run the web-app in development mode using:

```bash
yarn run start:dev
```

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
