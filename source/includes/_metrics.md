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
attributes | The [attributes hash](http://dev.librato.com/v1/metric-attributes) configures specific components of a metric's visualization.

### Measurement Properties

Each individual metric corresponds to a series of individual measurements. Some common properties are supported across all measurements.

Property | Definition
-------- | ----------
measure_time | The epoch time at which an individual measurement occurred with a maximum resolution of seconds.
value | The numeric value of an individual measurement. Multiple formats are supported (e.g. integer, floating point, etc) but the value must be numeric.
source | Source is an optional property that can be used to subdivide a common gauge/counter amongst multiple members of a population. For example the number of requests/second serviced by an application could be broken up amongst a group of server instances in a scale-out tier by setting the hostname as the value of source.
Source names can be up to 255 characters in length and must be composed of the following 'A-Za-z0-9.:-_'. The word all is a reserved word and cannot be used as a user source. The source namespace is case insensitive.

### Measurement Restrictions

Internally all floating point values are stored in double-precision format. However, Librato Metrics places the following restrictions on very large or very small floating point exponents:

* If the base-10 exponent of any floating point value is larger than `1 x 10^126`, the request will be aborted with a 400 status error code.

* If the base-10 exponent of any floating point value is smaller than `1 x 10^-130`, the value will be truncated to zero (0.0).

## Retrieve Metrics

>Example Request

```shell
GET https://metrics-api.librato.com/v1/metrics
```

>All metrics:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics'
```

>All metrics pertaining to requests:

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

The response is paginated, so the request supports our generic [Pagination Parameters](http://dev.librato.com/v1/pagination). Specific to metrics, the default and only permissible value of the `orderby` pagination parameter is `name`.

`name`: A search parameter that limits the results to metrics whose names contain a matching substring. The search is not case-sensitive.

Composite Metric Query Execution

This route will also execute a composite metric query string when the following parameter is specified. Metric pagination is not performed when executing a composite metric query.

compose
A composite metric query string to execute. If this parameter is specified it must be accompanied by time interval parameters. NOTE: start_time and resolution are required. The end_time parameter is optional. The count parameter is currently ignored. When specified, the response is a composite metric query response.

## Retrieve Metric Details

## Update Metric

## Delete Metric