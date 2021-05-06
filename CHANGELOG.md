# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.3.0] - 2021-05-06

### Added

- Logout endpoint (see [issue](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/53))
- Change to single configuration (see [issue](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/59))

### Changed

- Use published PROV4ITDaTA ui-package (see [issue](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/61))
- Updated Reporting

## [0.2.1] - 2021-02-05

### Changed

- Updated Reporting

## [0.2.0] - 2021-02-05

### Added

- Added Data Provider: Google People API (see [issue #44](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/44))

### Changed

- UI integration (see [issue](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/45))

### Fixed

- Building ui fails (see [issue](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/50))

## [0.1.1] - 2020-12-21

### Added

- RML Mappings for using DCAT vocabulary (see [issue #9](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/9))

### Changed

- Updated report: clarified RML Mapping (see [MR 24](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/merge_requests/24))
- Updated RML Mappings to use best-practice vocabularies (see [issue #8](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/8))
- Clean-up: optimized imports, adhering to filename convention (see [issue #30](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/30))

### Removed

- Deprecated code  (see [issue #30](https://gitlab.ilabt.imec.be/prov4itdata-dapsi/web-app/-/issues/30))

## 0.1.0 - 2020-12-03

### Added

- Authentication and authorization with Data Providers (Flickr & Imgur) and Solid Pod
- Integration of RMLMapper for generation of intermediate RDF (and provenance data) from Data Providers
- Support for downloading generated (provenance)data
- Authorized transfer functionality for Data Provider: Flickr
- Authorized transfer functionality for Data Provider: Imgur
- Authorized transfer functionality to Solid Pod

[0.2.1]: https://github.com/RMLio/prov4itdata-web-app/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/RMLio/prov4itdata-web-app/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/RMLio/prov4itdata-web-app/compare/v0.1.0...v0.1.1
