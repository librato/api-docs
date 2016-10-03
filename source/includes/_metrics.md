# Metrics

Metrics are custom measurements stored in Librato's Metrics service. These measurements are created and may be accessed programmatically through a set of RESTful API calls. There are currently two types of metrics that may be stored in Librato Metrics, `gauges` and `counters`.

### Gauges

Gauges capture a series of measurements where each measurement represents the value under observation at one point in time. The value of a gauge typically varies between some known minimum and maximum. Examples of gauge measurements include the requests/second serviced by an application, the amount of available disk space, the current value of $AAPL, etc.

### Counters

Counters track an increasing number of occurrences of some event. A counter is unbounded and always monotonically increasing in any given run. A new run is started anytime that counter is reset to zero. Examples of counter measurements include the number of connections made to an app, the number of visitors to a website, the number of a times a write operation failed, etc.

### Metric Properties

Some common properties are supported across all types of metrics:

Property | Definition
-------- | ----------
name | Each metric has a name that is unique to its class of metrics e.g. a gauge name must be unique among gauges. The name identifies a metric in subsequent API calls to store/query individual measurements and can be up to 255 characters in length. Valid characters for metric names are `A-Za-z0-9.:-_`. The metric namespace is case insensitive.
period | The `period` of a metric is an integer value that describes (in seconds) the standard reporting period of the metric. Setting the period enables Metrics to detect abnormal interruptions in reporting and aids in analytics.
description | The description of a metric is a string and may contain spaces. The description can be used to explain precisely what a metric is measuring, but is not required. This attribute is not currently exposed in the Librato UI.
display_name | More descriptive name of the metric which will be used in views on the Metrics website. Allows more characters than the metric `name`, including spaces, parentheses, colons and more.
attributes | The [attributes hash](#metric-attributes) configures specific components of a metric's visualization.
source_lag | This property sets a "look back" further in the data stream when rendering a composite metric for the purposes of alerting.  The default is 120, meaning we look back 2 minutes when rendering, which should normally be enough time for the appropriate sources to have reported their data.


### Measurement Properties

Each individual metric corresponds to a series of individual measurements. Some common properties are supported across all measurements.

Property | Definition
-------- | ----------
`measure_time` | The epoch time at which an individual measurement occurred with a maximum resolution of seconds.
`value` | The numeric value of an individual measurement. Multiple formats are supported (e.g. integer, floating point, etc) but the value must be numeric.
`source` | Source is an optional property that can be used to subdivide a common gauge/counter among multiple members of a population. For example the number of requests/second serviced by an application could be broken up among a group of server instances in a scale-out tier by setting the hostname as the value of source.
Source names can be up to 255 characters in length and must be composed of the characters `A-Za-z0-9.:-_`. The word all is a reserved word and cannot be used as a user source. The source namespace is case insensitive.

### Measurement Restrictions

Internally all floating point values are stored in double-precision format. However, Librato Metrics places the following restrictions on very large or very small floating point exponents:

* If the base-10 exponent of any floating point value is larger than `1 x 10^126`, the request will be aborted with a 400 status error code.

* If the base-10 exponent of any floating point value is smaller than `1 x 10^-130`, the value will be truncated to zero (0.0).

## Create a Metric

>How to create 3 new measurements: Two counter measurements (`conn_servers` and `write_fails`) and one gauge measurement (`cpu_temp`).

>The gauge measurement specifies an explicit `measure_time` and `source` that overrides the global ones while the counter measurements default to the global `measure_time` and `source`.

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'measure_time=1234567950' \
  -d 'source=prod-us-west' \
  -d 'counters[0][name]=conn_servers' \
  -d 'counters[0][value]=5' \
  -d 'counters[1][name]=write_fails' \
  -d 'counters[1][value]=3' \
  -d 'gauges[0][name]=cpu_temp' \
  -d 'gauges[0][value]=88.4' \
  -d 'gauges[0][source]=prod-us-east' \
  -d 'gauges[0][measure_time]=1234567949' \
  -X POST \
  https://metrics-api.librato.com/v1/metrics
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
queue = Librato::Metrics::Queue.new
queue.add :conn_servers => {:type => :counter, :measure_time => 1234567950, :value => 5}
queue.add :write_fails => {:type => :counter, :measure_time => 1234567950, :value => 3}
queue.add :cpu_temp => {:measure_time => 1234567949, :value => 88.4}
queue.submit
```

```python
import librato
api = librato.connect(<user>, <token>)
q  = api.new_queue()
q.add('conn_servers', 5, type='counter', source='prod-us-west')
q.add('write_fails', 3, type='counter', source='prod-us-west')
q.add('cpu_temp', 88.4, type='gauge', source='prod-us-east')
q.submit()
```

>Response Code:

```
200 Success
```

#### HTTP Request

`POST https://metrics-api.librato.com/v1/metrics`

This action allows you to create metrics and submit measurements for new or existing metrics. You can submit measurements for multiple metrics in a single request.

For each counter and gauge measurement in the request, a new measurement is created and associated with the appropriate metric. If any of the metrics in the submitted set do not currently exist, they will be created.

For truly large numbers of measurements (e.g. 20 metrics x 500 sources) we suggest batching into multiple concurrent requests. Currently a POST with ~300 distinct measurements takes roughly 600ms, so we recommend this as an initial guideline for a cap on request size. As we continue to tune the system this suggested cap will be updated.


### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Measurement Parameters

The request must include at least one gauge or counter measurement. It may include multiple counter or gauge measurements or a combination of multiple measurement types.

Gauge measurements are collated under the top-level parameter `gauges`. Similarly, counter measurements are collated under the top-level parameter key `counters`. Each measurement is a hash of measurement parameters as described below:

Parameter | Definition
--------- | ----------
name | The unique identifying name of the property being tracked. The metric name is used both to create new measurements and query existing measurements. Must be 255 or fewer characters, and may only consist of 'A-Za-z0-9.:-_'. Depending on the submission format the location of the name parameter may vary, see examples below in "Measurement Formats". The metric namespace is case insensitive.
value | The numeric value of a single measured sample.
measure_time<br>`optional` | The integer value of the [unix timestamp](http://en.wikipedia.org/wiki/Unix_time) of the measurement. If not specified will default to time the measurement is received.
source<br>`optional` | A string which describes the originating source of a measurement when that measurement is tracked across multiple members of a population. Examples: foo.bar.com, user-123, 77025. <br><br>Sources must be composed of 'A-Za-z0-9.:-_' and can be up to 255 characters in length. The word all is reserved and cannot be used as user source. The source namespace is case insensitive. <br><br>`source` and `measure_time` can also be specified as a parameters outside of the `gauges` and `counters` measurement hashes. In this case the given `source` and `measure_time` values will be applied to all values submitted unless those measurements have another `source` or `measure_time` specified in their sub-hashes. <br><br>**NOTE**: The [optional parameters](#update-metric) listed in the metrics PUT operation can be used with POST operations, but they will be ignored if the metric already exists. To update existing metrics, please use the PUT operation.

### Gauge Specific Parameters

Gauges support an optional, more complex parameter set which you can use to report multi-sample measurements:

Parameter | Definition
--------- | ----------
count | Indicates the request corresponds to a multi-sample measurement. This is useful if measurements are taken very frequently in a closed loop and the metric value is only periodically reported. If `count` is set, then `sum` must also be set in order to calculate an average value for the recorded metric measurement. Additionally `min`, `max`, and `sum_squares` may also be set when `count` is set. The `value` parameter should not be set if `count` is set.
sum | If `count` was set, `sum` must be set to the summation of the individual measurements. The combination of `count` and `sum` are used to calculate an average value for the recorded metric measurement.
max | If `count` was set, `max` can be used to report the largest individual measurement among the averaged set.
min | If `count` was set, `min` can be used to report the smallest individual measurement among the averaged set.
sum_squares | If `count` was set, `sum_squares` report the summation of the squared individual measurements. If `sum_squares` is set, a standard deviation can be calculated for the recorded metric measurement.

### Measurement Formats

The individual gauge and counter measurements can be specified in one of several formats:

### Hashed by Name

>The JSON payload below creates a gauge measurement for the gauge `login-delay` with a value `3.5`:

```json
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

>How to create two measurements for the gauge `login-delay`: one with the source `foo1.bar.com` and a second with `foo2.bar.com`:

```json
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

>The following JSON payload will create the same measurements as the previous example:

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


## Retrieve a Metric

The Librato API lets you search for metric metadata and measurements within the system. For example, you could
query a list of all available metrics in the system or those matching a specific naming pattern. When retrieving the
measurements of a specific metric you can specify a specific time range or limit the amount of data points returned.

### Metric Measurement Queries

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
        "display_transform": null,
        "display_units_long": "Requests",
        "display_units_short": "reqs"
      }
    }
  ]
}
```

In order to retrieve **measurements** from a specific metric, include the `name` parameter along with the metric name you wish to view measurement data from.

`https://metrics-api.librato.com/v1/metrics?name=metric_name`

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
    "display_transform": null,
    "display_units_long": "Fahrenheit",
    "display_units_short": "°F"
  }
}
```

>How to return the metric `cpu_temp` with up to four measurements at resolution 60:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/cpu_temp?count=4&resolution=60'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.get_metric :cpu_temp, count: 4, resolution: 60
```

```python
import librato
api = librato.connect(<user>, <token>)
metric = api.get("cpu_temp", count=4, resolution=60)
print(metric.measurements)
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

Returns information for a specific metric. If time interval search parameters are specified will also include a set of metric measurements for the given time span.

#### HTTP Request

`GET https://metrics-api.librato.com/v1/metrics/:name`

### Measurement Search Parameters

>How to return the metric `cpu_temp` with measurements from the source `server*`:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/cpu_temp?source=server*&count=4&resolution=60'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.get_metric :cpu_temp, source: :server, count: 4, resolution:60
```

```python
import librato
api = librato.connect(<user>, <token>)
metric = api.get("cpu_temp", source="server*", count=4, resolution=60)
print(metric.measurements)
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

>Return the metric `cpu_temp` with measurements from an array of sources, including server1.acme.com or server2.acme.com:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/cpu_temp?sources%5B%5D=server1.acme.com&sources%5B%5D=server2.acme.com&count=4&resolution=60'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.get_metric :cpu_temp, sources: ['server1.acme.com', 'server2.acme.com'], count: 4, resolution: 60
```

```python
import librato
api = librato.connect(<user>, <token>)
metric = api.get("cpu_temp", sources=['server1.acme.com', 'server2.acme.com'], count=4, resolution=60)
print(metric.measurements)
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

If optional [time interval search parameters](#time-intervals) are specified, the response includes the set of metric measurements covered by the time interval. Measurements are listed by their originating source name if one was specified when the measurement was created. All measurements that were created without an explicit source name are listed with the source name `unassigned`.

Search Parameter | Definition
----------------- | ----------
source | If `source` is specified, the response is limited to measurements from the given source name or pattern.
sources | If `sources` is specified, the response is limited to measurements from those sources. The sources parameter should be specified as an array of source names. The response is limited to the set of sources specified in the array.
summarize_time | If `summarize_time` is specified, then the individual measurements over the covered time period will be aggregated into a single summarized record for each source. In this case, the measurements array for each source will contain a single summarized record. <br><br>The `measure_time` in each of the summarized measurements will be set to the first `measure_time` in the period covered by the [time interval search parameters](#time-intervals). <br><br>If the metric is a counter, then the summarized record will be a gauge that represents the summarization of the deltas of the counter values for each source.
summarize_sources | If `summarize_sources` is specified, a source name `all` is included in the list of measurements. This special source name will include all measurements summarized across all the sources for each point in time. For each unique point in time within the covered time interval search, there will be a single record in the `all` measurements list. <br><br>If multiple sources published a measurement at the same time, the record in the `all` list will be a summarized record of all the individual source measurements at that point in time. If combined with the `summarize_time` parameter, then the `all` list will be summarized across sources and across time, implying it will be a list with a single record. <br><br>If the metric is a counter, then the summarized record will be a gauge that represents the summarization of the deltas of the counter values for each source.
breakout_sources | When `summarize_sources` is specified with multiple sources (and the `all` series is generated) by default the individual source series are also included in the response. Setting `breakout_sources` to `false` will reduce the response to only the `all` series. This reduces resource consumption when the individual series are not needed.
group_by | When querying a gauge and specifying multiple sources with the `sources` parameter the `group_by` parameter optionally specifies a statistical function used to generate an aggregated time series across sources identified in the response with the special source name `all`. The acceptable values for `group_by` are: `min`, `max`, `mean`, `sum`, `count`. <br><br>Each entry in the `all` series contains a set of summary statistics, each of which represents the result of applying the `group_by` function across that summary statistic in the corresponding entry in each the individual sources. For example when `group_by` is set to `max`, each entry in the `all` series specifies the minimum of the maximums as `min`, the maximum of the maximums as `max`, the maximum of the sums as `sum`, etc. <br><br>Regardless of the function specified for `group_by` each entry in `all` also includes a field named `summarized` that communicates how many individual source series were grouped at that point in time and a field named `count` that contains the total number of samples aggregated across all sources at that point in time. <br><br>Setting the `group_by` option implies both `summarize_sources=true` (required) and `breakout_sources=false` (can be optionally overridden).

### Composite Metric Queries

>Execute a composite query to derive the idle collectd CPU time for a given host:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics?compose=derive(s("collectd.cpu.*.idle","boatman*45"))&start_time=1432931007&resolution=60'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.get_composite 'derive(s("collectd.cpu.*.idle","boatman*45"))', start_time: Time.now.to_i - 60*60, resolution: 60
```

```python
import librato
api = librato.connect(<user>, <token>)
compose = 'derive(s("collectd.cpu.*.idle", "boatman*45", {period: "60"}))'
import time
start_time = 1432931007
resp = api.get_composite(compose, start_time=start_time)
resp['measurements'][0]['series']
```

>Response (the result of the `derive()` function over the idle CPU time):

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

This route will also execute a [composite metric query](https://www.librato.com/docs/kb/manipulate/composite_metrics/specification.html) string when the following parameter is specified. Metric pagination is not performed when executing a composite metric query.

Parameter | Definition
--------- | ----------
compose | A composite metric query string to execute. If this parameter is specified it must be accompanied by [time interval](#time-intervals) parameters.

**NOTE**: `start_time` and `resolution` are required. The `end_time` parameter is optional. The `count` parameter is currently ignored. When specified, the response is a composite metric query response.

## Time Intervals

Librato tracks and stores several different types of measurements as time-series data. Each measurement corresponds to a particular point in time. Queries are typically made to request the values over some time interval that is a subset of the entire series e.g. the last hour, last Monday, etc. The search parameters described below may be used in different combinations to specify a time interval when making queries against [metrics](#metrics).

### Time Interval Parameters

If an explicit interval (i.e. `start_time` to `end_time`) is specified, the response contains all measurements that fall within the interval. In this scenario the parameter `start_time` must be set, while `end_time` may be set or left to default to the current time.

An interval can also be implicitly specified through a `count` parameter. If `count` is set to N alongside with either (but not both) `start_time` or `end_time`, the response covers the time interval that covers N measurements. The value of `end_time` always defaults to the current time, so a request for the last N measurements only requires the `count` parameter set to N.

Request Parameter | Definition
----------------- | ----------
start_time | The [unix timestamp](http://en.wikipedia.org/wiki/Unix_time) indicating the start time of the desired interval.
end_time | The [unix timestamp](http://en.wikipedia.org/wiki/Unix_time) indicating the end time of the desired interval. If left unspecified it defaults to the current time.
count | The number of measurements desired. When specified as N in conjunction with `start_time`, the response contains the first N measurements after `start_time`. When specified as N in conjunction with `end_time`, the response contains the last N measurements before `end_time`.
resolution | A resolution for the response as measured in seconds. If the original measurements were reported at a higher resolution than specified in the request, the response contains averaged measurements.

## Pagination

>Return the metric `librato.cpu.percent.idle` with the `start_time` of 1303252025 (unix time):

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/librato.cpu.percent.idle?resolution=60&start_time=1303252025'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.get_metric :librato.cpu.percent.idle, start_time: 1303252025, resolution: 60
```

```python
import librato
api = librato.connect(<user>, <token>)
metric = api.get("librato.cpu.percent.idle", start_time="1303252025", resolution=60)
print(metric.measurements)
```

>If the response includes the following `query` section with `next_time` it implies there are more points and that `start_time` should be set to 1305562061 to retrieve the next matching elements.

```json
"query" : {
    "next_time" : 1305562061
}
```

>Note: In order to receive a `next_time` value, ensure you aren't including a `count` value in your request.

If a request does not include an explicit count and the matched data range includes more points than the maximum return size, then the response will include a pagination hint. In this case the response will include a parameter `next_time` in the `query` top-level response section. The `next_time` will be set to the epoch second start time of the next matching element of the original request. This hint serves two purposes:

1) It indicates there are more matching elements, but that the original request was truncated due to the response limit, and

2) It provides the `start_time` value that should be used in a subsequent request. If the original request is resubmitted with the `start_time` set to the returned `next_time` the response will include the next set of matching elements in the set. It may require multiple requests to page through the entire set if the number of matching elements is large.

### Request Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination5). Specific to metrics, the default and only permissible value of the `orderby` pagination parameter is `name`.

Parameter | Definition
--------- | ----------
name | A search parameter that limits the results to metrics whose names contain a matching substring. The search is not case-sensitive.

## Update a Metric

#### HTTP Request

`PUT https://metrics-api.librato.com/v1/metrics`

>Set the `period` and `display_min` for metrics `cpu`, `servers` and `reqs`:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'names=cpu&names=servers&names=reqs&period=60&display_min=0' \
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

If attributes are included which are specific to gauge metrics and the set of metrics provided includes counter metrics, those attributes will be applied only to the gauge metrics in the set.

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


>Create a gauge metric named `queue_len` (this assumes the metric does not exist):

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

If the metric name does not exist, then the metric will be created with the associated properties. Normally metrics are created the first time a measurement is sent to the [collated POST route](#submit-metrics), after which their properties can be updated with this route. However, sometimes it is useful to set the metric properties before the metric has received any measurements so this will create the metric if it does not exist. The property `type` must be set if the metric is to be created.

Creating Persisted Composite Metrics

With this route you can also create and update persisted [composite metrics](https://www.librato.com/docs/kb/manipulate/composite_metrics/specification.html). This allows you to save and use a composite definition as if it was a normal metric. To create a persisted composite set the `type` to composite and provide a composite definition in the `composite` parameter. A named metric will be created that can be used on instruments or alerts, similar to how you would use a regular metric.

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

The endpoint above returns **metadata** containing all of the available metrics recorded in your account.
