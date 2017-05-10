# Metrics

Metrics represent the individual time-series sent to the Librato service. Each measurement sent to Librato is associated with a Metric.

## Create a Metric

>Create a metric named `librato.cpu.percent.used` matching the tags `environment:prod` and `service:api`:

```shell
curl \
-u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
-H "Content-Type: application/json" \
-d '{
  "type": "gauge",
  "name": "librato.cpu.percent.used",
  "period": 60,
  "attributes": {
    "summarize_function": "sum"
  },
  "tags": {
    "environment": "prod",
    "service": "api"
  }
}' \
-X PUT \
'https://metrics-api.librato.com/v1/metrics/librato.cpu.percent.used'
```

Metrics are also automatically created by POSTing a measurement for the first time. See [Create a Measurement](#create-a-measurement).

### Creating Persisted Composite Metrics

>Create a persisted composite named `librato.cpu.percent.used` matching the tags `environment:prod` and `service:api`:

```shell
curl \
-u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
-H "Content-Type: application/json" \
-d '{
  "type": "composite",
  "name": "librato.cpu.percent.used",
  "composite": "s(\"librato.cpu.percent.user\", {\"environment\" : \"prod\", \"service\": \"api\"})"
}' \
-X PUT \
'https://metrics-api.librato.com/v1/metrics/librato.cpu.percent.used'
```

```ruby
Not yet available
```

```python
Not yet available
```

> Response Body

```
{
  "name": "librato.cpu.percent.used",
  "display_name": null,
  "type": "composite",
  "description": null,
  "period": null,
  "source_lag": null,
  "composite": "s(\"librato.cpu.percent.user\", {\"environment\" : \"prod\", \"service\": \"api\"})"
}
```

#### HTTP Request

`POST https://metrics-api.librato.com/v1/metrics/:name`

With this route you can also create and update persisted [composite metrics](https://www.librato.com/docs/kb/data_processing/composite_specification/). This allows you to save and use a composite definition as if it was a normal metric. To create a persisted composite set the `type` to composite and provide a composite definition in the `composite` parameter. A named metric will be created that can be used on instruments or alerts, similar to how you would use a regular metric.

## Retrieve a Metric

The Librato API lets you search for metric metadata and measurements within the system. For example, you could query a list of all available metrics in the system or those matching a specific naming pattern.

### Retrieve a Metric by Name

>How to retrieve the metadata for the metric `cpu_temp`:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/cpu_temp'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.get_metric :cpu_temp
```

```python
import librato
api = librato.connect(<user>, <token>)
metric = api.get("cpu_temp")
print(metric.attributes)
```

>Response Body:

```json
{
  "name": "cpu_temp",
  "display_name": "cpu_temp",
  "description": "Current CPU temperature in Fahrenheit",
  "period": 60,
  "type": "gauge",
  "attributes": {
    "created_by_ua": "librato-metrics/0.7.4 (ruby; 1.9.3p194; x86_64-linux) direct-faraday/0.8.4",
    "display_max": null,
    "display_min": 0,
    "display_stacked": true,
    "display_units_long": "Fahrenheit",
    "display_units_short": "°F"
  }
}
```

Returns information for a specific metric.

#### HTTP Request

`GET https://metrics-api.librato.com/v1/metrics/:name`

## Update a Metric

#### HTTP Request

`PUT https://metrics-api.librato.com/v1/metrics`

>Set the `period` and `display_min` for metrics `cpu`, `servers` and `reqs`:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'names%5B%5D=cpu&names%5B%5D=servers&names%5B%5D=reqs&period=60&display_min=0' \
  -X PUT \
  'https://metrics-api.librato.com/v1/metrics'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.update_metrics names: ["cpu", "servers", "reqs"], period: 60, display_min: 0
```

```python
import librato
api = librato.connect(<user>, <token>)
for name in ['cpu', 'servers', 'reqs']:
  gauge = api.get(name)
  attrs['period'] = '60'
  attrs['display_min'] = '0'
  api.update(name, attributes=attrs)
```

>Set the `display_units_short` for all metrics that end with `.time`:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'names=*.time&display_units_short=ms' \
  -X PUT \
  'https://metrics-api.librato.com/v1/metrics'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.update_metrics names: ["*.time"] , display_units_short: "ms"
```

```python
Not available
```

>Response Code

```
204 No Content OR 202 Accepted
```

>Response Headers

```
Location: <job-checking URI>  # issued only for 202
```

Update the [properties](#metrics) and/or [attributes](#metric-attributes) of a set of metrics at the same time.

This route accepts either a list of metric names OR a single pattern which includes wildcards (`*`).

There are two potential success states for this action, either a `204 No Content` (all changes are complete) or a `202 Accepted`.

A `202` will be issued when the metric set is large enough that it cannot be operated on immediately. In those cases a `Location`: response header will be included which identifies a [Job resource](#jobs) which can be monitored to determine when the operation is complete and if it has been successful.

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Update a Metric by Name

>Update the existing metric temp by setting the display_name and the minimum display attribute.

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'display_name=Temperature in Celsius&attributes[display_min]=0' \
  -X PUT \
  'https://metrics-api.librato.com/v1/metrics/temp'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.update_metric :temp, name: "Temperature in Celsius", attributes: { display_min: '0' }
```

```python
import librato
api = librato.connect(<user>, <token>)
for metric in api.list_metrics(name="temp"):
  gauge = api.get(metric.name)
  attrs = gauge.attributes
  attrs['display_name'] = 'Temperature in Celsius'
  attrs['display_min'] = '0'
  api.update(metric.name, attributes=attrs)
```

>Response Code

```
204 No Content
```

>Create a metric named `queue_len` (this assumes the metric does not exist):

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'type=gauge&description=Length of app queue&display_name=num. elements' \
  -X PUT \
  'https://metrics-api.librato.com/v1/metrics/queue_len'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.update_metric :queue_len, type: :gauge, display_name: "num. elements", period: 15
```

```python
import librato
api = librato.connect(<user>, <token>)
api.submit("queue_len", 10)
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/metrics/queue_len
```

>Response Body

```json
{
  "name": "queue_len",
  "description": "Length of app queue",
  "display_name": "num. elements",
  "type": "gauge",
  "period": null,
  "attributes": {
    "created_by_ua": "curl/7.24.0 (x86_64-redhat-linux-gnu) libcurl/7.24.0 NSS/3.13.5.0 zlib/1.2.5 libidn/1.24 libssh2/1.4.1"
  }
}
```

#### HTTP Request

`PUT https://metrics-api.librato.com/v1/metrics/:name`

Updates or creates the metric identified by `name`. If the metric already exists, it performs an update of the metric's properties.

If the metric name does not exist, then the metric will be created with the associated properties. Normally metrics are created the first time a measurement is sent to the [collated POST route](#create-a-metric), after which their properties can be updated with this route. However, sometimes it is useful to set the metric properties before the metric has received any measurements so this will create the metric if it does not exist.

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

Create Parameters

Parameter | Definition
--------- | ----------
type | Type of metric to create (gauge, counter, or composite).
display_name<br>`optional` | Name which will be used for the metric when viewing the Metrics website.
description<br>`optional` | Text that can be used to explain precisely what the gauge is measuring.
period<br>`optional` | Number of seconds that is the standard reporting period of the metric. Setting the period enables Metrics to detect abnormal interruptions in reporting and aids in analytics. For gauge metrics that have service-side aggregation enabled, this option will define the period that aggregation occurs on.
attributes<br>`optional` | The attributes hash configures specific components of a metric's visualization.
composite<br>`optional` | The composite definition. Only used when type is composite.

## Delete a Metric

#### HTTP Request

`DELETE https://metrics-api.librato.com/v1/metrics`

> Delete the metrics `cpu`, `servers` and `reqs`:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'names%5B%5D=cpu&names%5B%5D=servers&names%5B%5D=reqs' \
  -X DELETE \
  'https://metrics-api.librato.com/v1/metrics'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.delete_metrics :cpu, :servers, :reqs
```

```python
import librato
api = librato.connect(<user>, <token>)
api.delete(names=['cpu', 'servers', 'reqs'])
```

>Delete all metrics that start with `cpu` and end with `.90`:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'names=cpu*.90' \
  -X DELETE \
  'https://metrics-api.librato.com/v1/metrics'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.delete_metrics names: ["cpu*.90"]
```

```python
Not available
```

>Response Code

```
204 No Content OR 202 Accepted
```

>Response Headers

```
Location: <job-checking URI>  # issued only for 202
```

Batch-delete a set of metrics. Both the metrics and all of their measurements will be removed. All data deleted will be unrecoverable, so use this with care.

This route accepts either a list of metric names OR a single pattern which includes wildcards (`*`).

If you post measurements to a metric name after deleting the metric, that metric will be re-created as a new metric with measurements starting from that point.

There are two potential success states for this action, either a `204 No Content` (all changes are complete) or a `202 Accepted`.

A `202` will be issued when the metric set is large enough that it cannot be operated on immediately. In those cases a `Location`: response header will be included which identifies a [Job resource](#jobs) which can be monitored to determine when the operation is complete and if it has been successful.

<aside class="notice">If you have attempted to DELETE a metric but it is still in your metric list, ensure that you are not continuing to submit measurements to the metric you are trying to delete.</aside>

### Delete a Metric by Name

#### HTTP Request

`DELETE https://metrics-api.librato.com/v1/metrics/:name`


>Delete the metric named `app_requests`.

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X DELETE \
  'https://metrics-api.librato.com/v1/metrics/app_requests'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.delete_metrics :app_requests
```

```python
import librato
api = librato.connect(<user>, <token>)
api.delete("app_requests")
```

>Response Code

```
204 No Content
```

Delete the metric identified by :name. This will delete both the metric and all of its measurements.

If you post measurements to a metric name after deleting the metric, that metric will be re-created as a new metric with measurements starting from that point.

If you have attempted to DELETE a metric but it is still in your metric list, ensure that you are not continuing to submit measurements to the metric you are trying to delete.

## List All Metrics

#### HTTP Request

`GET https://metrics-api.librato.com/v1/metrics`

### Metric Metadata Queries

>List all metrics:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.metrics
```

```python
import librato
api = librato.connect(<user>, <token>)
api.list_metrics()
```

>Response Code

```
200 OK
```

>Response (when there are two total):

```json
{
  "query": {
    "found": 2,
    "length": 2,
    "offset": 0,
    "total": 2
  },
  "metrics": [
    {
      "name": "app_requests",
      "display_name": "app_requests",
      "description": "HTTP requests serviced by the app per-minute",
      "period": 60,
      "type": "counter",
      "attributes": {
        "created_by_ua": "librato-metrics/0.7.4 (ruby; 1.9.3p194; x86_64-linux) direct-faraday/0.8.4",
        "display_max": null,
        "display_min": 0,
        "display_stacked": true,
        "display_units_long": "Requests",
        "display_units_short": "reqs"
      }
    },
    {
      "name": "cpu_temp",
      "display_name": "cpu_temp",
      "description": "Current CPU temperature in Fahrenheit",
      "period": 60,
      "type": "gauge",
      "attributes": {
        "created_by_ua": "librato-metrics/0.7.4 (ruby; 1.9.3p194; x86_64-linux) direct-faraday/0.8.4",
        "display_max": null,
        "display_min": 0,
        "display_stacked": true,
        "display_units_long": "Fahrenheit",
        "display_units_short": "°F"
      }
    }
  ]
}
```

The endpoint above returns **metadata** containing all of the available metrics recorded in your account.

### List a Subset of Metrics

>Retrieve all metrics containing `request` in the metric name:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics?name=request'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.metrics name:'request'
```

```python
import librato
api = librato.connect(<user>, <token>)
api.list_metrics(name="request")
```

>Response (when one of the two metrics measure requests):

```json
{
  "query": {
    "found": 1,
    "length": 1,
    "offset": 0,
    "total": 2
  },
  "metrics": [
    {
      "name": "app_requests",
      "display_name": "app_requests",
      "description": "HTTP requests serviced by the app per-minute",
      "period": 60,
      "type": "counter",
      "attributes": {
        "created_by_ua": "librato-metrics/0.7.4 (ruby; 1.9.3p194; x86_64-linux) direct-faraday/0.8.4",
        "display_max": null,
        "display_min": 0,
        "display_stacked": true,
        "display_units_long": "Requests",
        "display_units_short": "reqs"
      }
    }
  ]
}
```

In order to retrieve **measurements** from a specific metric, include the `name` parameter along with the metric name you wish to view measurement data from.

`https://metrics-api.librato.com/v1/metrics?name=metric_name`
