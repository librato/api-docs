# Metrics

## Overview

Metrics are custom measurements stored in Librato's Metrics service. These measurements are created and may be accessed programatically through a set of RESTful API calls. There are currently two types of metrics that may be stored in Librato Metrics, `gauges` and `counters`.

### Gauges

Gauges capture a series of measurements where each measurement represents the value under observation at one point in time. The value of a gauge typically varies between some known minimum and maximum. Examples of gauge measurements include the requests/second serviced by an application, the amount of available disk space, the current value of $AAPL, etc.

### Counters

Counters track an increasing number of occurrences of some event. A counter is unbounded and always monotonically increasing in any given run. A new run is started anytime that counter is reset to zero. Examples of counter measurements include the number of connections made to an app, the number of visitors to a website, the number of a times a write operation failed, etc.

### Metric Properties

Some common properties are supported across all types of metrics:

Property | Definition
-------- | ----------
name | Each metric has a name that is unique to its class of metrics e.g. a gauge name must be unique amongst gauges. The name identifies a metric in subsequent API calls to store/query individual measurements and can be up to 255 characters in length. Valid characters for metric names are 'A-Za-z0-9.:-_'. The metric namespace is case insensitive.
period | The `period` of a metric is an integer value that describes (in seconds) the standard reporting period of the metric. Setting the period enables Metrics to detect abnormal interruptions in reporting and aids in analytics.
description | The description of a metric is a string and may contain spaces. The description can be used to explain precisely what a metric is measuring, but is not required. This attribute is not currently exposed in the Librato UI.
display_name | More descriptive name of the metric which will be used in views on the Metrics website. Allows more characters than the metric `name`, including spaces, parentheses, colons and more.
attributes | The [attributes hash](#metric-attributes) configures specific components of a metric's visualization.

### Measurement Properties

Each individual metric corresponds to a series of individual measurements. Some common properties are supported across all measurements.

Property | Definition
-------- | ----------
measure_time | The epoch time at which an individual measurement occurred with a maximum resolution of seconds.
value | The numeric value of an individual measurement. Multiple formats are supported (e.g. integer, floating point, etc) but the value must be numeric.
source | Source is an optional property that can be used to subdivide a common gauge/counter amongst multiple members of a population. For example the number of requests/second serviced by an application could be broken up amongst a group of server instances in a scale-out tier by setting the hostname as the value of source.
Source names can be up to 255 characters in length and must be composed of the characters `A-Za-z0-9.:-_`. The word all is a reserved word and cannot be used as a user source. The source namespace is case insensitive.

### Measurement Restrictions

Internally all floating point values are stored in double-precision format. However, Librato Metrics places the following restrictions on very large or very small floating point exponents:

* If the base-10 exponent of any floating point value is larger than `1 x 10^126`, the request will be aborted with a 400 status error code.

* If the base-10 exponent of any floating point value is smaller than `1 x 10^-130`, the value will be truncated to zero (0.0).

## Retrieve Metrics

>Definition

```
GET https://metrics-api.librato.com/v1/metrics
```

>Example Request

>Retrieve all metrics:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics'
```

>Retrieve all metrics pertaining to a request:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics?name=request'
```

>Execute a composite query to derive the idle collectd CPU time for a given host:

```
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics?compose=derive(s("collectd.cpu.*.idle","boatman*45"))&start_time=1432931007&resolution=60'
```

>With URL Encoding

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics?compose=derive(s(%22collectd.cpu.*.idle%22,%20%22boatman*45%22))&start_time=1432931007&resolution=60'
```

>Response Code

```shell
200 OK
```

>Response Headers

```
** NOT APPLICABLE **
```

>Response Body for all metrics (when there are two total):

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
        "display_transform": null,
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
        "display_transform": null,
        "display_units_long": "Fahrenheit",
        "display_units_short": "°F"
      }
    }
  ]
}
```

>Metrics corresponding to requests (when one of the two metrics measure requests):

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
        "display_transform": null,
        "display_units_long": "Requests",
        "display_units_short": "reqs"
      }
    }
  ]
}
```

>Composite query results for displaying the result of the derive() function over the idle CPU time.

```json
{
  "compose": "derive(s(\"collectd.cpu.*.idle\",\"boatman*19\"))",
  "measurements": [
    {
      "metric": {
        "attributes": {
          "aggregate": false,
          "created_by_ua": "Collectd-Librato.py/0.0.8 (Linux; x86_64) Python-Urllib2/2.7",
          "display_max": null,
          "display_min": null,
          "display_stacked": true,
          "display_transform": null,
          "display_units_long": "Units",
          "gap_detection": true
        },
        "description": null,
        "display_name": null,
        "name": "collectd.cpu.0.cpu.idle",
        "period": 60,
        "type": "counter"
      },
      "period": 60,
      "query": {
        "metric": "collectd.cpu.*.idle",
        "source": "boatman*19"
      },
      "series": [
        {
          "measure_time": 1395802200,
          "value": 5831.0
        },
        {
          "measure_time": 1395802620,
          "value": 5748.0
        }
      ],
      "source": {
        "display_name": null,
        "name": "boatman-stg_19"
      }
    }
  ],
  "resolution": 60
}
```

### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination). Specific to metrics, the default and only permissible value of the `orderby` pagination parameter is `name`.

Parameter | Definition
--------- | ----------
name | A search parameter that limits the results to metrics whose names contain a matching substring. The search is not case-sensitive.

### Composite Metric Query Execution

This route will also execute a [composite metric query](https://www.librato.com/docs/kb/manipulate/composite_metrics/specification.html) string when the following parameter is specified. Metric pagination is not performed when executing a composite metric query.

Parameter | Definition
--------- | ----------
compose | A composite metric query string to execute. If this parameter is specified it must be accompanied by [time interval](#time-intervals) parameters. 

**NOTE**: `start_time` and `resolution` are required. The `end_time` parameter is optional. The `count` parameter is currently ignored. When specified, the response is a composite metric query response.

## Retrieve Metric by Name

>Definition

```
GET https://metrics-api.librato.com/v1/metrics/:name
```

>Example Request: Return metadata for the metric `cpu_temp`:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/cpu_temp'
```

>Response Code:

```
200 OK
```

>Response Headers:

```
** NOT APPLICABLE **
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
    "display_transform": null,
    "display_units_long": "Fahrenheit",
    "display_units_short": "°F"
  }
}
```

>Example Request

>Return the metric `cpu_temp` with up to four measurements at resolution 60:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/cpu_temp?count=4&resolution=60'
```

>Response Body:

```json
{
  "resolution": 60,
  "measurements": {
    "server1.acme.com": [
      {
        "measure_time": 1234567890,
        "value": 84.5,
        "count": 1
      },
      {
        "measure_time": 1234567950,
        "value": 86.7,
        "count": 1
      },
      {
        "measure_time": 1234568010,
        "value": 84.6,
        "count": 1
      },
      {
        "measure_time": 1234568070,
        "value": 89.7,
        "count": 1
      }
    ]
  },
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
    "display_transform": null,
    "display_units_long": "Fahrenheit",
    "display_units_short": "°F"
  }
}
```

>Example Request

>Return the metric `cpu_temp` with measurements from the source `server*`:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/cpu_temp?source=server*&count=4&resolution=60'
```

>Response Body:

```json
{
  "resolution": 60,
  "measurements": {
    "server1.acme.com": [
      {
        "measure_time": 1234567890,
        "value": 84.5,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 86.7,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 84.6,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 89.7,
        "count": 1
      }
    ],
    "server2.acme.com": [
      {
        "measure_time": 1234567890,
        "value": 94.5,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 96.7,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 94.6,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 99.7,
        "count": 1
      }
    ]
  },
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
    "display_transform": null,
    "display_units_long": "Fahrenheit",
    "display_units_short": "°F"
  }
}
```

>Example Request: Return the metric `cpu_temp` with measurements from an array of sources, including server1.acme.com or server2.acme.com:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/cpu_temp?sources%5B%5D=server1.acme.com&sources%5B%5D=server2.acme.com&count=4&resolution=60'
```

>Response Body:

```json
{
  "resolution": 60,
  "measurements": {
    "server1.acme.com": [
      {
        "measure_time": 1234567890,
        "value": 84.5,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 86.7,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 84.6,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 89.7,
        "count": 1
      }
    ],
    "server2.acme.com": [
      {
        "measure_time": 1234567890,
        "value": 94.5,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 96.7,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 94.6,
        "count": 1
      },
      {
        "measure_time": 1234567890,
        "value": 99.7,
        "count": 1
      }
    ]
  },
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
    "display_transform": null,
    "display_units_long": "Fahrenheit",
    "display_units_short": "°F"
  }
}
```

Returns information for a specific metric. If time interval search parameters are specified will also include a set of metric measurements for the given time span.

### Measurement Search Parameters

If optional [time interval search parameters](#time-intervals) are specified, the response includes the set of metric measurements covered by the time interval. Measurements are listed by their originating source name if one was specified when the measurement was created. All measurements that were created without an explicit source name are listed with the source name `unassigned`.

Search Parameter | Definition
----------------- | ----------
source | If `source` is specified, the response is limited to measurements from the given source name or pattern.
sources | If `sources` is specified, the response is limited to measurements from those sources. The sources parameter should be specified as an array of source names. The response is limited to the set of sources specified in the array.
summarize_time | If `summarize_time` is specified, then the individual measurements over the covered time period will be aggregated into a single summarized record for each source. In this case, the measurements array for each source will contain a single summarized record. <br><br>The `measure_time` in each of the summarized measurements will be set to the first `measure_time` in the period covered by the [time interval search parameters](#time-intervals). <br><br>If the metric is a counter, then the summarized record will be a gauge that represents the summarization of the deltas of the counter values for each source.
summarize_sources | If `summarize_sources` is specified, a source name `all` is included in the list of measurements. This special source name will include all measurements summarized across all the sources for each point in time. For each unique point in time within the covered time interval search, there will be a single record in the `all` measurements list. <br><br>If multiple sources published a measurement at the same time, the record in the `all` list will be a summarized record of all the individual source measurements at that point in time. If combined with the `summarize_time` parameter, then the `all` list will be summarized across sources and across time, implying it will be a list with a single record. <br><br>If the metric is a counter, then the summarized record will be a gauge that represents the summarization of the deltas of the counter values for each source.
breakout_sources | When `summarize_sources` is specified with multiple sources (and the `all` series is generated) by default the individual source series are also included in the response. Setting `breakout_sources` to `false` will reduce the response to only the `all` series. This reduces resource consumption when the individual series are not needed.
group_by | When querying a gauge and specifying multiple sources with the `sources` parameter the `group_by` parameter optionally specifies a statistical function used to generate an aggregated time series across sources identifed in the response with the special source name `all`. The acceptable values for `group_by` are: `min`, `max`, `mean`, `sum`, `count`. <br><br>Each entry in the `all` series contains a set of summary statistics, each of which represents the result of applying the `group_by` function across that summary statistic in the corresponding entry in each the individual sources. For example when `group_by` is set to `max`, each entry in the `all` series specifies the minimum of the maximums as `min`, the maximum of the maxiums as `max`, the maximum of the sums as `sum`, etc. <br><br>Regardless of the function specified for `group_by` each entry in `all` also includes a field named `summarized` that communicates how many individual source series were grouped at that point in time and a field named `count` that contains the total number of samples aggregated across all sources at that point in time. <br><br>Setting the `group_by` option implies both `summarize_sources=true` (required) and `breakout_sources=false` (can be optionally overridden).

## Submit Metrics

>Definition

```
POST https://metrics-api.librato.com/v1/metrics
```

>Example Request

>This creates a total of three new measurements: two counter measurements (conn_servers and write_fails) and one gauge measurement (cpu_temp).

>The gauge measurement specifies an explicit measure_time and source that overrides the global ones while the counter measurements default to the global measure_time and source.

>Default measure_time and source:

```shell
curl \
  -u <user>:<token> \
  -d 'measure_time=1234567950' \
  -d 'source=blah.com' \
  -d 'counters[0][name]=conn_servers' \
  -d 'counters[0][value]=5' \
  -d 'counters[1][name]=write_fails' \
  -d 'counters[1][value]=3' \
  -d 'gauges[0][name]=cpu_temp' \
  -d 'gauges[0][value]=88.4' \
  -d 'gauges[0][source]=cpu0_blah.com' \
  -d 'gauges[0][measure_time]=1234567949' \
  -X POST \
  https://metrics-api.librato.com/v1/metrics
```

>Response Code:

```
200 Success
```

>Response Body:

```
** NOT APPLICABLE **
```

This action allows you to create metrics and submit measurements for new or existing metrics. You can submit measurements for multiple metrics in a single request.

For each counter and gauge measurement in the request, a new measurement is created and associated with the appropriate metric. If any of the metrics in the submitted set do not currently exist, they will be created.

For truly large numbers of measurements (e.g. 20 metrics x 500 sources) we suggest batching into multiple concurrent requests. Currently a POST with ~300 distinct measurements takes roughly 600ms, so we recommend this as an initial guideline for a cap on request size. As we continue to tune the system this suggested cap will be updated.


### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

###Measurement Parameters

The request must include at least one gauge or counter measurement. It may include multiple counter or gauge measurements or a combination of multiple measurement types.

Gauge measurements are collated under the top-level parameter `gauges`. Similarly, counter measurements are collated under the top-level parameter key `counters`. Each measurement is a hash of measurement parameters as described below:

Parameter | Definition
--------- | ----------
name | The unique identifying name of the property being tracked. The metric name is used both to create new measurements and query existing measurements. Must be 255 or fewer characters, and may only consist of 'A-Za-z0-9.:-_'. Depending on the submission format the location of the name parameter may vary, see examples below in "Measurement Formats". The metric namespace is case insensitive.
value | The numeric value of a single measured sample.
measure_time<br>`optional` | The integer value of the [unix timestamp](http://en.wikipedia.org/wiki/Unix_time) of the measurement. If not specified will default to time the measurement is received.
source<br>`optional` | A string which describes the originating source of a measurement when that measurement is tracked across multiple members of a population. Examples: foo.bar.com, user-123, 77025. <br><br>Sources must be composed of 'A-Za-z0-9.:-_' and can be up to 255 characters in length. The word all is reserved and cannot be used as user source. The source namespace is case insensitive. <br><br>`source` and `measure_time` can also be specified as a parameters outside of the `gauges` and `counters` measurement hashes. In this case the given `source` and `measure_time` values will be applied to all values submitted unless those measurements have another `source` or `measure_time` specified in their sub-hashes. <br><br>**NOTE**: The [optional parameters](#update-metric-by-name) listed in the metrics PUT operation can be used with POST operations, but they will be ignored if the metric already exists. To update existing metrics, please use the PUT operation.

### Gauge Specific Parameters

Gauges support an optional, more complex parameter set which you can use to report multi-sample measurements:

Parameter | Definition
--------- | ----------
count | Indicates the request corresponds to a multi-sample measurement. This is useful if measurements are taken very frequently in a closed loop and the metric value is only periodically reported. If `count` is set, then `sum` must also be set in order to calculate an average value for the recorded metric measurement. Additionally `min`, `max`, and `sum_squares` may also be set when `count` is set. The `value` parameter should not be set if `count` is set.
sum | If `count` was set, `sum` must be set to the summation of the individual measurements. The combination of `count` and `sum` are used to calculate an average value for the recorded metric measurement.
max | If `count` was set, `max` can be used to report the largest individual measurement amongst the averaged set.
min | If `count` was set, `min` can be used to report the smallest individual measurement amongst the averaged set.
sum_squares | If `count` was set, `sum_squares` report the summation of the squared individual measurements. If `sum_squares` is set, a standard deviation can be calculated for the recorded metric measurement.

### Measurement Formats

The individual gauge and counter measurements can be specified in one of several formats:

### Hashed by Name

>Hashed by name Example:

>The example below creates a gauge measurement for the gauge login-delay with a value 3.5.

```curl
{
  "gauges": {
    "login-delay": {
      "value": 3.5,
      "source": "foo.bar.com"
    }
  }
}
```

Each metric name is a hash to the measurement values. 

### Multiple measurements with the same name

>For example:

```curl
{
  "gauges": {
    "0": {
      "name": "login-delay",
      "value": 3.5,
      "source": "foo1.bar.com"
    },
    "1": {
      "name": "login-delay",
      "value": 2.6,
      "source": "foo2.bar.com"
    }
  }
}
```

If you would like to specify two measurements for the same gauge (maybe to specify two different sources), you can specify a name parameter within the measurement that overrides the hash key name.

### Array format (JSON only)

>For example, the following JSON message will create the same measurements as the previous example:

```json
{
  "gauges": [
    {
      "name": "login-delay",
      "value": 3.5,
      "source": "foo1.bar.com"
    },
    {
      "name": "login-delay",
      "value": 2.6,
      "source": "foo2.bar.com"
    }
  ]
}
```

If the submission Content-Type is JSON, you can also specify the measurement parameters in an array format. This is only supported in JSON formats since the URL-encoded-form content type does not support an array format.

The example to the right will create two measurements for the gauge login-delay: one with the source foo1.bar.com and a second with foo2.bar.com.

## Update Metric

>Definition

```
PUT https://metrics-api.librato.com/v1/metrics
```

>Example Request

>Set the `period` and `display_min` for metrics `cpu`, `servers` and `reqs`:

```shell
curl \
  -u <user>:<token> \
  -d 'names%5B%5D=cpu&names%5B%5D=servers&names%5B%5D=reqs&period=60&display_min=0' \
  -X PUT \
  'https://metrics-api.librato.com/v1/metrics'
```

>Example Request

>Set the `display_units_short` for all metrics that end with `.time`:

```shell
curl \
  -u <user>:<token> \
  -d 'names=*.time&display_units_short=ms' \
  -X PUT \
  'https://metrics-api.librato.com/v1/metrics'
```

>Response Code

```
204 No Content OR 202 Accepted
```

>Response Headers

```
Location: <job-checking URI>  # issued only for 202
```

>Response Body

```
** NOT APPLICABLE **
```

Update the [properties](#metrics) and/or [attributes](#metric-attributes) of a set of metrics at the same time.

This route accepts either a list of metric names OR a single pattern which includes wildcards (`*`).

If attributes are included which are specific to gauge metrics and the set of metrics provided includes counter metrics, those attributes will be applied only to the gauge metrics in the set.

There are two potential success states for this action, either a `204 No Content` (all changes are complete) or a `202 Accepted`.

A `202` will be issued when the metric set is large enough that it cannot be operated on immediately. In those cases a `Location`: response header will be included which identifies a [Job resource](#jobs) which can be monitored to determine when the operation is complete and if it has been successful.

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

## Update Metric by Name

>Definition

```
PUT https://metrics-api.librato.com/v1/metrics/:name
```

>Example Request

>Update the existing metric temp by setting the display_name and the minimum display attribute.

```shell
curl \
  -u <user>:<token> \
  -d 'display_name=Temperature in Celsius&attributes[display_min]=0' \
  -X PUT \
  'https://metrics-api.librato.com/v1/metrics/temp'
```

>Response Code

```
204 No Content
```

>Response Body

```
** NOT APPLICABLE **
```

>Example Request

>Create a gauge metric named `queue_len` (this assumes the metric does not exist):

```shell
curl \
  -u <user>:<token> \
  -d 'type=gauge&description=Length of app queue&display_name=num. elements' \
  -X PUT \
  'https://metrics-api.librato.com/v1/metrics/queue_len'
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

Updates or creates the metric identified by `name`. If the metric already exists, it performs an update of the metric's properties.

If the metric name does not exist, then the metric will be created with the associated properties. Normally metrics are created the first time a measurement is sent to the [collated POST route](#submit-metrics), after which their properties can be updated with this route. However, sometimes it is useful to set the metric properties before the metric has received any measurements so this will create the metric if it does not exist. The property `type` must be set if the metric is to be created.

Creating Persisted Composite Metrics

With this route you can also create and update persisted [composite metrics](https://www.librato.com/docs/kb/manipulate/composite_metrics/specification.html). This allows you to save and use a composite definition as if it was a normal metric. To create a persisted composite set the `type` to composite and provide a composite definition in the `composite` parameter. A named metric will be created that can be used on instruments or alerts, similar to how you would use a regular metric.

### Headers

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

## Delete Metric

>Definition

```
DELETE https://metrics-api.librato.com/v1/metrics
```

>Example Request

> Delete the metrics `cpu`, `servers` and `reqs`:

```shell
curl \
  -u <user>:<token> \
  -d 'names%5B%5D=cpu&names%5B%5D=servers&names%5B%5D=reqs' \
  -X DELETE \
  'https://metrics-api.librato.com/v1/metrics'
```

>Delete all metrics that start with `cpu` and end with `.90`:

```shell
curl \
  -u <user>:<token> \
  -d 'names=cpu*.90' \
  -X DELETE \
  'https://metrics-api.librato.com/v1/metrics'
```

>Response Code

```
204 No Content OR 202 Accepted
```

>Response Headers

```
Location: <job-checking URI>  # issued only for 202
```

>Response Body

```
** NOT APPLICABLE **
```

Batch-delete a set of metrics. Both the metrics and all of their measurements will be removed. All data deleted will be unrecoverable, so use this with care.

This route accepts either a list of metric names OR a single pattern which includes wilcards (`*`).

If you post measurements to a metric name after deleting the metric, that metric will be re-created as a new metric with measurements starting from that point.

There are two potential success states for this action, either a `204 No Content` (all changes are complete) or a `202 Accepted`.

A `202` will be issued when the metric set is large enough that it cannot be operated on immediately. In those cases a `Location`: response header will be included which identifies a [Job resource](#jobs) which can be monitored to determine when the operation is complete and if it has been successful.

<aside class="notice">If you have attempted to DELETE a metric but it is still in your metric list, ensure that you are not continuing to submit measurements to the metric you are trying to delete.</aside>

## Delete Metric by Name

>Definition

```
DELETE https://metrics-api.librato.com/v1/metrics/:name
```

>Example Request

>Delete the metric named `app_requests`.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/metrics/app_requests'
```

>Response Code

```
204 No Content
```

>Response Headers

```
** NOT APPLICABLE **
```

>Response Body

```
** NOT APPLICABLE **
```

Delete the metric identified by :name. This will delete both the metric and all of its measurements.

If you post measurements to a metric name after deleting the metric, that metric will be re-created as a new metric with measurements starting from that point.

If you have attempted to DELETE a metric but it is still in your metric list, ensure that you are not continuing to submit measurements to the metric you are trying to delete.