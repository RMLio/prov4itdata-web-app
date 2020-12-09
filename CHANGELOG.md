# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- RML Mappings for using DCAT vocabulary (see [issue #9](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/9))

### Changed
- Updated report: clarified RML Mapping (see [MR 24](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/merge_requests/24))
- Updated RML Mappings to use best-practice vocabularies (see [issue #8](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/8))

## [0.1.0] - 2020-12-03

### Added

- Authentication and authorization with Data Providers (Flickr & Imgur) and Solid Pod
- Integration of RMLMapper for generation of intermediate RDF (and provenance data) from Data Providers
- Support for downloading generated (provenance)data 
- Authorized transfer functionality for Data Provider: Flickr
- Authorized transfer functionality for Data Provider: Imgur
- Authorized transfer functionality to Solid Pod