# Sources

When submitting a measurement to Librato, in addition to specifying the metric name you can optionally specify a source name as additional metadata. This is useful when you are tracking the same metrics across a set of homogeneous entities.

For example, you can specify the server instances in a cluster (source name => hostname) or sensors in a grid (source name => MAC address).

For more information on sources and how they can be leveraged, check out [this knowledge base article](https://kb-docs-archive.librato.com/faq/whats_a_source.html).

#### Source Properties

Properties | Definition
---------- | ----------
name | The name of the source.
display_name | Human readable name to use in place of the actual source name. Maximum length 255 characters.


## Create a Source

>Update an existing source `i-d32d61af` by setting the `display_name` to `web-frontend-0`:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'display_name=web-frontend-0' \
  -X PUT \
  'https://metrics-api.librato.com/v1/sources/i-d32d61af'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.update_source "i-d32d61af", display_name: "web-frontend-0"
```

>Response Code

```
204 No Content
```

>Create a source name `foo.bar.com` (assumes this source does not exist):

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'display_name=FooBar' \
  -X PUT \
  'https://metrics-api.librato.com/v1/sources/foo.bar.com'
```

```ruby
Not available
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/sources/foo.bar.com
```

>Response Body

```json
{
  "name": "foo.bar.com",
  "display_name": "FooBar"
}
```

Creates or updates the source identified by `:name`. If the source name does not exist, the source will be created with the associated properties. If the source already exists, properties will be updated.

Typically sources are created the first time a measurement for a given source is sent to the [collated POST route](#create-a-metric).

#### HTTP Request

`PUT https://metrics-api.librato.com/v1/sources/:name`

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### Parameters

Parameter | Definition
--------- | ----------
name | Each metric has a name that is unique to its class of metrics e.g. a gauge name must be unique amongst gauges. The name identifies a metric in subsequent API calls to store/query individual measurements and can be up to 255 characters in length. Valid characters for metric names are `A-Za-z0-9.:-_`. The metric namespace is case insensitive.
display_name<br>`optional` | Human readable name to use in place of the actual source name. Maximum length 255 characters.


## Retrieve a Source

>Return the source named `foo.bar.com`:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/sources/foo.bar.com'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.get_source "foo.bar.com"
```

>Response Code

```
200 OK
```

>Response Body

```json
{
  "name": "foo.bar.com",
  "display_name": "FooBar"
}
```

Returns the current representation of the source identifed by name.

#### HTTP Request

`GET https://metrics-api.librato.com/v1/sources/:name`

## List all Sources

>Return all sources:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/sources'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.sources
```

>Return all sources owned by the user with name matching example:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/sources?name=example'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.sources name: "example"
```

>Response Code

```
200 OK
```

>Response Body

```json
{
  "query": {
    "found": 4,
    "length": 4,
    "offset": 0,
    "total": 15
  },
  "sources": [
    {
      "name": "prod.example.com",
      "display_name": null
    },
    {
      "name": "stg1.example.com",
      "display_name": "Staging 1"
    },
    {
      "name": "stg2.example.com",
      "display_name": "Staging 2"
    },
    {
      "name": "foo.bar.com",
      "display_name": "Example Source"
    }
  ]
}
```

Returns all sources created by the user.

#### HTTP Request

`GET https://metrics-api.librato.com/v1/sources`

#### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination5). Specific to sources, the default value of the `orderby` pagination parameter is name, and the permissible values of the `orderby` pagination parameter are: `name`.

Parameter | Definition
--------- | ----------
name | Searches both the names and display_names of the source. Case-insensitive.
