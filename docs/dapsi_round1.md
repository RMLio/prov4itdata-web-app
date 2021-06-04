<style>
:not(pre):not(.hljs) > code {
	color: #695E25 !important; /* Override color */
}

:not(figure) > img {
  max-width: 600px;
  max-height: 600px
}
</style>

# Final report - DAPSI Round 1

This report covers all requested data for the final evaluation of the DAPSI program, round 1.
It will describe technical validation, business validation, commitment validation, and participation in the final event.
Where relevant, it will link to public documentation.

## Technical validation

### The maturity and completeness of the implemented application/prototype

The PROV4ITDaTa platform was bootstrapped during the DAPSI program.
We cannot claim maturity for the demonstrator,
however, the open-source components on which it is based -- [RMLMapper-JAVA] and [Comunica] -- _are_ mature and have seen (large) uptake in the community,
both academic and in industry.

### Easy deployment

All components built during the DAPSI program have been published on NPM: <https://www.npmjs.com/search?q=prov4itdata>,
and installation is documented at <https://github.com/RMLio/prov4itdata-web-app>.
All configuration languages (RML, SPARQL) are standardized and documented: <https://rml.io/specs/rml/> and <https://www.w3.org/TR/sparql11-query/>.

### Proper document for future integration

The open-source components on which PROV4ITDaTa is based -- [RMLMapper-JAVA] and [Comunica] -- are properly documented
and have seen integration in multiple projects, both academic and in industry.
PROV4ITDaTa is also documented in detail at <https://prov4itdata.ilabt.imec.be/docs/>.

### Personalised criteria

See below for adherence to the milestones

#### M1: Design configuration-based DTP exporter, applying it to a use case (deadline 10/2020)

See [Architecture] on how we used RML.io to export data from DTP-like services.
See <https://prov4itdata.ilabt.imec.be/> for a demonstrator, documentation at <https://prov4itdata.ilabt.imec.be/docs/>. At [Demonstrator], there is a video of how the demonstrator works.

#### M2: Improve data provenance of the DTP exporter (deadline 12/2020)

See [Components/RMLMapper] and [Components/Web App]
on how we automatically generate and showcase data provenance information as an interoperable resource in RDF using PROV-O statements, see [Features/Automatic Data Provenance Generation] for details

#### M3: Design query-based DTP importer for Solid, applying it to a use case (deadline 01/2020)

We first import the exported data in RDF into a Solid pod, see [Components/Web App].
We then designed the query-based importer: we extended Comunica to perform federated queries over both Solid pods and possibly other RDF data sources,
whilst automatically generating the correct provenance information, see [Components/Comunica].

#### M4: Implement configuration-based DTP exporter (deadline 04/2020)

See [Components/RML Mapping Documents] and [Components/RMLMapper]
on how we allow personalizable and configurable export of multiple DTP services in RDF, using RML.io.
We extended this work allowing federated querying and schema translation
-- resulting in more flexible export options --
with Comunica, see [Components/Comunica].

See [Architecture/Configuration] for details about the
configuration of RML Mappings, queries, and pipelines.

#### M5: Implement provenance-based DTP exporter (deadline 05/2020)

We aligned with the design executed in M3, and extended Comunica by including
different levels of provenance data to the query results, see [Components/Comunica].

#### M6: Implement query-based DTP importer for Solid (deadline 04/2020)

The generated RDF data resulting from the [Components/RMLMapper]
can be refined by selecting
specific parts through the use of SPARQL queries. See [Components/Comunica].

#### M7: Integrate and finalize the exporter and importer, showcasing the use case (deadline 05/2020)

Our first sprint contained an end-to-end solution without a query-based importer.
Our second sprint refactored the user interface to ease future extensibility and included an additional connector, see [Demonstrator].
Our third sprint includes the query-based configuration and Comunica engine.
The end-to-end solution is independent of the use-case,
demonstrated by the fact that different types of data can be processed by PROV4ITDaTa.

#### KPIs of Annex 2 - Phase 1

Below, we link to the public documentation for answers of the KPIs of Annex 2, phase 1

- Does the configuration answer the requirements set by the customer?
  - We currently support similar functionality as DTP: exporting data from multiple services, and importing it into a personal data service, see [Requirements] and [Demonstrator] for details
- Are you satisfied with the use case considered?
  - We currently support Flickr, Imgur, and Google data (see [Use Cases]), showcasing the use-case independence.
- Are you satisfied with the improvement of data provenance?
  - We automatically create data provenance using PROV-O statements, compared to black-box systems such as DTP, see [Features/Automatic Data Provenance Generation] for details.
- Check FAIR
  - Using RML.io, the resulting data transfer process adheres to the FAIR principles, see [Features/Mapping files to transfer data] for details.
- Does the architecture include functions that support Data Transparency?
  - We allow investigating both the mapping documents and the provenance statements, providing transparency before and after the transfer process, see [Features/Mapping files to transfer data] and [Features/Automatic Data Provenance Generation].
- Data collection
  - As the user can inspect the RML mapping documents, they can verify beforehand which data fields are being collected. The currently collected data fields are detailed under [Use Cases].
- Jurisdictional Issues
  - A discussion on Privacy and GDPR is included in the documentation, see [Features/Security and Privacy] and [Features/GDPR].
- Does the architecture include functions that support Data Interoperability?
  - We make maximal use of Semantic Web technologies and other open standards to ensure data interoperability, more discussion at [Features/Use Open Standards and Open Source] and [Features/Output RDF].
- Check Syntactic Interoperability (connectivity, endpoint invocation)
  - We make use of the standardized Turtle syntax to ensure syntactic interoperability, see [Features/Output RDF/Syntactic Interoperability].
- Check Semantic Interoperability
  - We make use of established ontologies to ensure semantic interoperability, see [Features/Output RDF/Semantic Interoperability].
- Check Structural interoperability
  - We make use of RDF to ensure structural interoperability, see [Features/Output RDF/Structural Interoperability].
- Does the architecture include functions that support Data Compatibility?
  - Given the above, we claim to support data compatibility,  see [Features/Output RDF/Data Compatibility].
- Is the data stored following a specific standard?
  - We use the Semantic Web Standards such as RDF, Turtle, and R2RML, see [Features/Use Open Standards and Open Source].
- Is the communication secured by the system?
  - We make use of Transport Layer Security, see [Features/Security and Privacy/Data Retention].
- check Access control
  - No personal data is stored by PROV4ITData itself, for all related services (e.g., Flickr, Imgur, Solid), the respective Access Control systems are used, see [Features/Security and Privacy/User Control].
- check Certification
  - We did not undergo a certification review yet.
- check Personalization
  - Currently, users can choose different mapping templates, allowing for a limited support of personalization. The platform can be configured to personalize/customize the mappings. See [Configuration] and [Personalization].
- How you find the Quality of the transferred data?
  - Best-effort mapping templates created by experts and adhering to well-established data models are currently provided. However the detailed customization allows for data portability in varying levels of quality, depending on the requirements of the specific use cases.
- Does the design respect all GDPR compliance requirements?
  - We provide a GDPR discussion at [Features/GDPR].
- How many functionalities have been implemented?
  - We currently demonstrate an end-to-end transparent transfer process, where the user can extract data from different services and import it into its personal Solid pod. An overview is given at [Demonstrator].
- Are you satisfied with query-based
  - We apply Comunica to integrate data from different sources and possibly rewrite the data schema, more info at [Components/Comunica].
- Check if it covers data portability?
  - Our demonstrator allows to create interoperable data from existing services, imported into a Solid Pod, see [Features/Data Portability].
- Are you satisfied with the results of a query based for the use case considered
  - Best-effort query templates created by experts are currently provided. However the detailed customization allows for data portability in varying levels of quality, depending on the requirements of the specific use cases.
- Check use case if adaptable for other use cases?
  - We currently support Flickr, Imgur, and Google data showcasing the adaptivity to different use cases (see [Use Cases]), but the detailed configuration allows to support other use cases too.

#### KPIs of Annex 2 - Phase 2

Below, we link to the public documentation for answers of the KPIs of Annex 2, phase 2

- Does the prototype answer the requirements set by the customer?
  - An overview of the prototype is given at [Demonstrator].
- Has the comunica engine been adapted correctly?
  - Adaptation of the Comunica was joint work together with the Comunica developers. An overview of the adaptation is available at [Components/Comunica]
- Are you satisfied with the federated queries
  - [ ] TODO
- How many data sources have been queried
  - [ ] TODO
- How the results are integrated into SOLID pod
  - All the interoperable data is stored into Solid pods, for a detailed discussion, see [Components/Solid pods]
- In what kind of format are the results being returned
  - We adhere to Semantic Web standards, see [Features/Output RDF].
- Are you satisfied about how personalizable and configurable the export of multiple DTP services in RDF is using RML?
  - A detailed discussion on configuration is available at [Architecture/Configuration].
- schema translation, how and what is the quality?
  - Best-effort query templates created by experts are currently provided. However the detailed customization allows for data portability in varying levels of quality, depending on the requirements of the specific use cases.
- Are multiple configurations supported? how many?
  - We currently support Flickr, Imgur, and Google data showcasing the adaptivity to different use cases (see [Use Cases]), but the detailed configuration allows to support other use cases too.
- Are you satisfied with the new demo showing the whole prototype?
  - The demo is available at <https://prov4itdata.ilabt.imec.be>, the description is available at [Demonstrator].
- Mapping process?
- Are you satisfied with the functionalities implemented?
  - We currently demonstrate an end-to-end transparent transfer process, where the user can extract data from different services and import it into its personal Solid pod. An overview is given at [Demonstrator].
- Does the design respect all GDPR compliance requirements?
  - We provide a GDPR discussion at [Features/GDPR].
- Attractiveness: Overall impression of the product. Do users like or dislike it?
  - We did not focus on attractiveness, since PROV4ITDaTa is meant to be a platform integrated for different use cases. Still, we adhered to standard web application development practices such as responsive design and reusable ui components.
- Perspicuity: Is it easy to get familiar with the product and to learn how to use it?
  - For the end-user, a one-click procedure is sufficient to port their data. For developers, tutorials are available on creating RML Mapping documents, see [Components/RML Mapping Documents].
- Efficiency: Can users solve their tasks without unnecessary effort? Does it react fast?
  - For the end-user, a one-click procedure is sufficient to port their data. An overview is given at [Demonstrator] 
- Dependability: Does the user feel in control of the interaction? Is it secure and predictable?
  - All interactions follow standard security practices such as TLS network securty and OAuth authentication, see [Features/Security and Privacy].
- Stimulation: Is it exciting and motivating to use the product? Is it fun to use?
  - We did not focus on stimulation, since PROV4ITDaTa is meant to be a platform integrated for different use cases.
- Novelty: Is the design of the product creative? Does it catch the interest of users?
  - We did not focus on novelty/design, since PROV4ITDaTa is meant to be a platform integrated for different use cases.

## Business validation

Personal data control is a clear driver for PROV4ITDaTa.
The Solid initiative has seen considerable attention in (popular) media,
academia,
and industry.
Not only in the US, but also in Europe and specifically Belgium
there is a growing interest in Solid,
exemplified by interest from use case holders such as the Flemish government,
but also the growing amount of companies providing Solid support
such as Digita and DataVillage.

We believe that PROV4ITDaTa can fill the gap between the current status and the Solid vision,
by providing the services needed to port personal data from existing web services
into Solid pods.

As such, we act as an enabler for the companies that provide Solid support,
and companies that create Solid applications.
We believe to have a clear value proposition for those companies:
PROV4ITDaTa makes it easier for you to onboard new customers onto Solid,
by providing a platform-as-a-service that makes it easier to port your customer's existing data into Solid pods.

We initially target Solid companies.
These could be companies providing Solid support,
creating Solid applications,
or Solid enablers such as the data utility company being founded in Flanders.
Given the increasing importance of our core technologies (knowledge graphs),
we believe this will not only bootstrap the Solid ecosystem
but also grows wider into more use cases,
which could equally benefit from PROV4ITDaTa services.

PROV4ITDaTa positions itself as an integration Platform as a Service (iPaaS)
initially targeted at Personal Information Management Systems (PIMS),
but extensible to Enterprise Data Management (EDM).
We focus on the specific market segment handling knowledge graphs.

Our competitors such as Ontopic, Stardog, and DataLens also provide flexible knowledge graph generation on top of standardized configuration,
but don't provide integration services that directly connect with the Solid ecosystem.

### Business Model

We are currently providing professional services and implement pilot projects
on top of our existing open-source components RMLMapper-JAVA and Communica.
Our business model for PROV4ITDaTa follows the same trajectory.

### Sales

- [ ] TODO

#### Sales plan

- [ ] TODO

We are building a community.
Already doing projects with Flanders and have contacts with EC
W3C Community Group for standards track

#### Presentation and explanation of the price

- [ ] TODO

#### Details on the commercial release - customer acquisition?

- [ ] TODO

#### Number of Letter of Intent/Pilots signed after Phase 1

- [ ] TODO

### Financial planning

> Financial planning and 18-month forecast

### Team Motivation

- [ ] TODO

## Commitment validation

> The attendance to the following sessions is expected:
- There will be a session organised with mentors.
- There will be two technical trainings.

> The attendance to these sessions and the provision of the requested information (if any) will be assessed with a 10%.

> Other activities will be optional such as the webinar about public funding opportunities.

- [ ] TODO

## Participation in the final event

> A final event will be organised. Each project will participate with a short presentation to explain the project developed. It will be held in a date to be confirmed, close to the end of phase 2.

- [ ] TODO

[Architecture]: https://prov4itdata.ilabt.imec.be/docs/#architecture
[Architecture/Configuration]: https://prov4itdata.ilabt.imec.be/docs/#configuration
[Configuration]: https://prov4itdata.ilabt.imec.be/docs/#configuration
[Components/Comunica]: https://prov4itdata.ilabt.imec.be/docs/#comunica
[Components/RML Mapping Documents]: https://prov4itdata.ilabt.imec.be/docs/#rml-mapping-documents
[Components/RMLMapper]: https://prov4itdata.ilabt.imec.be/docs/#rmlmapper
[Components/Solid pods]: https://prov4itdata.ilabt.imec.be/docs/#solid-pods
[Components/Web App]: https://prov4itdata.ilabt.imec.be/docs/#web-app
[Demonstrator]: https://prov4itdata.ilabt.imec.be/docs/#demonstrator
[Features/Automatic Data Provenance Generation]: https://prov4itdata.ilabt.imec.be/docs/#automatic-data-provenance-generation
[Features/Data Portability]: https://prov4itdata.ilabt.imec.be/docs/#data-portability
[Features/GDPR]: https://prov4itdata.ilabt.imec.be/docs/#gdpr
[Features/Mapping files to transfer data]: https://prov4itdata.ilabt.imec.be/docs/#mapping-files-to-transfer-data
[Features/Output RDF]: https://prov4itdata.ilabt.imec.be/docs/#output-rdf
[Features/Output RDF/Data Compatibility]: https://prov4itdata.ilabt.imec.be/docs/#data-compatibility.
[Features/Output RDF/Semantic Interoperability]: https://prov4itdata.ilabt.imec.be/docs/#semantic-interoperability
[Features/Output RDF/Structural Interoperability]: https://prov4itdata.ilabt.imec.be/docs/#structural-interoperability
[Features/Output RDF/Syntactic Interoperability]: https://prov4itdata.ilabt.imec.be/docs/#syntactic-interoperability
[Features/Security and Privacy]: https://prov4itdata.ilabt.imec.be/docs/#security-and-privacy
[Features/Security and Privacy/Data Retention]: https://prov4itdata.ilabt.imec.be/docs/#data-retention
[Features/Security and Privacy/User Control]:https://prov4itdata.ilabt.imec.be/docs/#user-control
[Features/Use Open Standards and Open Source]: https://prov4itdata.ilabt.imec.be/docs/#use-open-standards-and-open-source
[Personalization]: https://prov4itdata.ilabt.imec.be/docs/#personalization
[Requirements]: https://prov4itdata.ilabt.imec.be/docs/#requirements
[Use Cases]: https://prov4itdata.ilabt.imec.be/docs/#use-cases
[RMLMapper-JAVA]: https://github.com/RMLio/rmlmapper-java
[Comunica]: https://github.com/comunica/comunica
