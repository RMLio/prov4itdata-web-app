# Draft

*Things we need to further detail in next iterations of the documentation*

## RML - Logical Source across different Web Services

<!-- 
  @bdm: I'm really not sure about this.
  For example, when considering on how to define the rml:source, the only similarities between these services are:
  1. both are defined as a schema:WebAPI
  2. both have a schema:name
  3. both have a schema:url

  Now, when comparing the differences, we have the following
  - Flickr: uses a request parameter mapping. 
  - Imgur: actually contains a http header mapping (cfr. the AuthorizationHeader)
    - Additional note: actually, the ex:AuthorizationHeader should be wrapped inside some kind of ex:httpHeaderMapping (which can be an fno:Mapping) 
-->

Regardless of the difference on how requests are made to different  services, they can be defined uniformly in the logical source of an RML Mapping. Every service is described as a `schema:WebAPI` with a `schema:name` and `schema:url` attribute.

```turtle
:flickr_my_images_source
    a schema:WebAPI;
    schema:name "Flickr API";
    schema:url <https://api.flickr.com/services/rest/>;

    ex:requestParameterMapping :flickr_request_parameter_mapping;
.
```

```turtle
:imgur_my_images_source
    a schema:WebAPI;
    schema:name "Imgur API";
    schema:url <https://api.imgur.com/3/account/me/images>;
    ex:AuthorizationHeader "{{authorizationHeader}}";
.
```