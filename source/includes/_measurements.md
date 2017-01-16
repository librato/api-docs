# Measurements

Measurements represent the individual time-series samples sent to the Librato service. They are associated with a metric, one or more tag pairs, and a point in time.

Each measurement has a value that represents an observation at one point in time. The value of a measurement will typically vary between some minimum or maximum value (ex. CPU usage moving from 0% to 100%).


### Measurement Properties

The general properties of a measurement are described below. The [documentation on submitting measurements](#create-a-measurement) includes a full overview of all acceptable parameters.

Property | Definition
-------- | ----------
name | The unique identifying name of the property being tracked. The metric name is used both to create new measurements and query existing measurements.
tags | A set of key/value pairs that describe the particular data stream. Tags behave as extra dimensions that data streams can be filtered and aggregated along. Examples include the region a server is located in, the size of a cloud instance or the country a user registers from. The full set of unique tag pairs defines a single data stream.
value | The numeric value of a single measured sample.
time | Unix Time (epoch seconds). This defines the time that a measurement is recorded at. It is useful when sending measurements from multiple sources to align them on a given time boundary, eg. time=floor(Time.now, 60) to align samples on a 60 second tick.
period | Define the period for the metric. This will be persisted for new metrics and used as the metric period for metrics marked for Service-Side Aggregation.


## Create a Measurement

>Create a new measurement `my.custom.metric` with the tag `region: "us-east-1", az: "a"`

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "tags": {
      "region": "us-east-1"
      "az": "a"
    },
    "measurements": [
      {
        "name": "my.custom.metric",
        "value": 65
      }
    ]
  }' \
  -X POST \
  https://metrics-api.librato.com/v1/measurements
```

```ruby
require 'librato/metrics'
Librato::Metrics.authenticate 'email', 'api_key'

queue = Librato::Metrics::Queue.new
queue.add "my.custom.metric" { 
  value: 65, 
  tags: { 
    region: 'us-east-1', 
    az: 'a' 
  } 
}
queue.submit
```

```python
Not yet available
```

#### HTTP Request

`POST https://metrics-api.librato.com/v1/measurements`

This action allows you to submit measurements for new or existing metric data streams. You can submit measurements for multiple metrics in a single request.

If the metric referenced by the name property of a measurement does not exist, it will be created prior to saving the measurements. Any metric properties included in the request will be used when creating this initial metric. However, if the metric already exists the properties will not update the given metric.

For truly large numbers of measurements we suggest batching into multiple concurrent requests. It is recommended that you keep batch requests under 1,000 measurements/post. As we continue to tune the system this suggested cap will be updated.

#### Headers

The only permissible content type is JSON at the moment. All requests must include the following header:

`Content-Type: application/json`

#### Measurement Parameters

>**Top-Level Tags**

>The following payload demonstrates submitting tags at the top-level of the payload. This may be common for a collection agent that tags all metrics the same based on the identification of the collection host parameters.

>This will result in two data streams, `cpu` and `memory`. Both metrics will contain the tags `region=us-west` and `name=web-prod-3`.

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "tags": {
      "region": "us-west",
      "name": "web-prod-3"
    },
    "measurements": [
      {
        "name": "cpu",
        "value": 4.5
      },
      {
        "name": "memory",
        "value": 10.5
      }
    ]
  }' \
-X POST \
https://metrics-api.librato.com/v1/measurements
```

```ruby
require 'librato/metrics'
Librato::Metrics.authenticate 'email', 'api_key'

queue = Librato::Metrics::Queue.new(
  tags: { 
    region: 'us-west', 
    name: 'web-prod-3'
  }
)
queue.add cpu: 4.5
queue.add memory: 10.5

queue.submit
```

```python
Not yet available
```

>**Embedded Measurement Tags**

>You can mix top-level tags with per-measurement tags. In the following example, the `cpu` metric strips the `name` tag out, while the `memory` metric adds two additional tag names.

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "tags": {
      "region": "us-west",
      "name": "web-prod-3"
    },
    "measurements": [
      {
        "name": "cpu",
        "value": 4.5,
        "tags": {
          "name": null
        }
      },
      {
        "name": "memory",
        "value": 34.5,
        "tags": {
          "az": "e",
          "db": "db-prod-1"
        }
      }
    ]
  }' \
-X POST \
https://metrics-api.librato.com/v1/measurements
```

```ruby
require 'librato/metrics'
Librato::Metrics.authenticate 'email', 'api_key'

queue = Librato::Metrics::Queue.new(
  tags: { 
    region: 'us-west', 
    name: 'web-prod-3'
  }
)
queue.add cpu: { 
  value: 4.5, 
  tags: { 
    name: null 
  } 
}
queue.add memory: { 
  value: 34.5, 
  tags: { 
    az: "e", 
    db: "db-prod-1"
  } 
}

queue.submit
```

```python
Not yet available
```

>**Full Measurement Sample**

>Submit a single measurement that contains a full summary statistics fields. This includes embedded tag names and the metric attribute (which specifies not to enable [SSA](/docs/kb/data_processing/ssa.html)) that is saved when the initial metric (cpu) is created.

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "measurements": [
      {
        "name": "cpu",
        "time": 1421530163,
        "period": 60,
        "attributes": {
          "aggregate": false
        },
        "sum": 35.0,
        "count": 3,
        "min": 4.5,
        "max": 6.7,
        "last": 2.5,
        "stddev": 1.34,
        "tags": {
          "region": "us-east-1",
          "az": "b",
          "role": "kafka",
          "environment": "prod",
          "instance": "3"
        }
      }
    ]
  }' \
-X POST \
https://metrics-api.librato.com/v1/measurements
```

```ruby

require 'librato/metrics'
Librato::Metrics.authenticate 'email', 'api_key'

queue = Librato::Metrics::Queue.new
queue.add cpu: { 
  time: 1421530163,
  period: 60,
  sum: 35,
  count: 3,
  min: 4.5,
  max: 6.7,
  last: 2.5,
  stddev: 1.34,
  attributes: {
    aggregate: false
  },
  tags: { 
    region: "us-east-1", 
    az: "b",
    role: "kafka",
    environment: "prod",
    instance: "3" 
  } 
}

queue.submit
```

```python
Not yet available
```

#### Individual Sample Parameters

The request must include at least one measurement. Measurements are collated under the top-level parameter **measurements**. The minimum required fields for a measurement are:

Parameter | Definition
--------- | ----------
name | The unique identifying name of the property being tracked. The metric name is used both to create new measurements and query existing measurements. Must be 255 or fewer characters, and may only consist of 'A-Za-z0-9.:-_'. The metric namespace is case insensitive.
value | The numeric value of a single measured sample.
tags | A set of key/value pairs that describe the particular data stream. Tags behave as extra dimensions that data streams can be filtered and aggregated along. Examples include the region a server is located in, the size of a cloud instance or the country a user registers from. The full set of unique tag pairs defines a single data stream.<br><br>Tags are merged between the top-level tags and any per-measurement tags, see the section Tag Merging for details.

#### Global or per-sample parameters

In addition, the following parameters can be specified to further define the measurement sample. They may be set at the individual measurement level or at the top-level. The top-level value is used unless the same parameter is set at an individual measurement.

Parameter | Definition
--------- | ----------
time | Unix Time (epoch seconds). This defines the time that a measurement is recorded at. It is useful when sending measurements from multiple sources to align them on a given time boundary, eg. time=floor(Time.now, 60) to align samples on a 60 second tick.
period | Define the period for the metric. This will be persisted for new metrics and used as the metric period for metrics marked for Service-Side Aggregation.

#### Summary fields

Measurements can contain a single floating point value or they can support samples that have been aggregated prior to submission (eg. with statsd) with the following summary fields:

Parameter | Definition
--------- | ----------
count | Indicates the request corresponds to a multi-sample measurement. This is useful if measurements are taken very frequently in a closed loop and the metric value is only periodically reported. If count is set, then sum must also be set in order to calculate an average value for the recorded metric measurement. Additionally min, max, and stddev/stddev_m2 may also be set when count is set. The value parameter should not be set if count is set.
sum | If count was set, sum must be set to the summation of the individual measurements. The combination of count and sum are used to calculate an average value for the recorded metric measurement.
max | If count was set, max can be used to report the largest individual measurement amongst the averaged set.
min | If count was set, min can be used to report the smallest individual measurement amongst the averaged set.
last | Represents the last value seen in the interval. Useful when tracking derivatives over points in time.
stddev | Represents the standard deviation of the sample set. If the measurement represents an aggregation of multiple samples, standard deviation can be calculated and included with the sample. Standard deviations are averaged when downsampling multiple samples over time.
stddev_m2 | Represents the current mean value when aggregating samples using the [alternative standard deviation method](#standard-deviation). The current mean value allows an accurate standard deviation calculation when aggregating multiple samples over time. Only one of stddev and stddev_m2 may be set.

#### Optional Parameters

**NOTE**: The [optional parameters](#update-a-metric) listed in the metrics PUT operation can be used with POST operations, but they will be ignored if the metric already exists. To update existing metrics, please use the PUT operation.

### Tag Merging

A given payload can mix tag definitions at the top-level tags parameter or tags can be specified per measurement (and eventually event). A tag with the same name in the measurement block will override any value set at the top-level. Any tag defined at the top-level, but not included in the measurement tag block will be merged with the measurement tags. To unset or clear a tag at the top-level, the tag name can be set to the JSON "null" value in the measurement block.

### Rate Limiting

Every response will include headers that define the current API limits related to the request made, the current usage of the account towards this limit, the total capacity of the limit and when the API limit will be reset.

### Measurement Restrictions

#### Name Restrictions

Metric names must be 255 or fewer characters, and may only consist of `A-Za-z0-9.:-_`. The metric namespace is case insensitive.

Tag names must match the regular expression `/\A[-.:_\w]+\z/{1,64}`. Tag names are always converted to lower case.

Tag values must match the regular expression `/\A[-.:_\w]+\z/{1, 256}`. Tag values are always converted to lower case.

Data streams have a default limit of **10** tag names per measurement.

Accounts have a default limit of **100** unique tag names.

Metrics have a maximum permitted cardinality for tag values. This maximum will be enforced as both a create rate limit and total cardinality limit.

#### Float Restrictions

Internally all floating point values are stored in double-precision format. However, Librato places the following restrictions on very large or very small floating point exponents:

If the base-10 exponent of any floating point value is larger than `1 x 10^126`, the request will be aborted with a 400 status error code.

If the base-10 exponent of any floating point value is smaller than `1 x 10^-130`, the value will be truncated to zero (`0.0`).

## Retrieve a Measurement

>**Retrieve Measurements by Matching Tags**

>How to retrieve the measurement `AWS.EC2.DiskWriteBytes` with the tags matching `region=us*` and `name=prod`:

>Note: When using cURL you will need to utilize URL encoding for the tag brackets (`%5B` and `%5D`)

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/measurements/AWS.EC2.DiskWriteBytes?resolution=60&duration=86400&tags%5Bregion%5D=us-*&tags%5Bname%5D=prod'
```

```ruby
require 'librato/metrics'
Librato::Metrics.authenticate 'email', 'api_key'

query = {
  resolution: 60,
  duration: 86400,
  tags: {
    region: "us*", 
    name: "prod*"
  }
}

measurements = Librato::Metrics.get_series "AWS.EC2.DiskWriteBytes", query

```

```python
Not yet available
```

>Response:

```json
{
  "series":[
    {
      "tags":{
         "name":"prod",
         "region":"us-east"
      },
      "measurements":[
         {
            "time":1476218700,
            "value":753.0
         },
         {
            "time":1476219840,
            "value":25.0
         },
         {
            "time":1476219900,
            "value":758.0
         }
      ]
    },
    {
      "tags":{
         "name":"prod",
         "region":"us-west"
      },
      "measurements":[
        {
           "time":1476218700,
           "value":496.0
        }
      ]
    }
  ],
  "resolution":60,
  "name":"AWS.EC2.DiskWriteBytes"
}
```

>How to retrieve the measurements `AWS.EC2.DiskWriteBytes` with the tags matching `region=us-east` OR `region=us-west` AND `name=prod` (also group by region):

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/measurements/AWS.EC2.DiskWriteBytes?resolution=60&duration=86400&tags%5Bregion%5D=us-*&tags%5Bname%5D=prod&group_by=region&group_by_function=sum'
```

```ruby
require 'librato/metrics'
Librato::Metrics.authenticate 'email', 'api_key'

query = {
  resolution: 60,
  duration: 86400,
  group_by: "region",
  group_by_function: "sum",
    tags: {
    region: "us*", 
    name: "prod*"
  }
}

measurements = Librato::Metrics.get_series "AWS.EC2.DiskWriteBytes", query
```

```python
Not yet available
```

>Response:

```json
{
  "series":[
    {
      "tags":{
         "region":"us-east"
      },
      "measurements":[
        {
           "time":1476218700,
           "value":753.0
        },
        {
           "time":1476219840,
           "value":25.0
        },
        {
           "time":1476219900,
           "value":758.0
        }
      ]
    },
    {
      "tags":{
         "region":"us-west"
      },
      "measurements":[
        {
           "time":1476218700,
           "value":496.0
        }
      ]
    }
  ],
  "resolution":60,
  "name":"AWS.EC2.DiskWriteBytes"
}
```

>**Retrieve Measurements Using tags_search**

>How to use the `tags_search` parameter to retrieve measurements for `memory` which match the tags `region=us-east*` and `db=prod`.

>In cURL you will need to apply URL encoding to the parameter `tags_search=region=us-east* and db=*prod*`.

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/measurements/memory?resolution=60&duration=86400&tags_search=region%3Dus-east*%20and%20db%3D*prod*'
```

```ruby
require 'librato/metrics'
Librato::Metrics.authenticate 'email', 'api_key'

query = {
  resolution: 60,
  duration: 86400,
  tags_search: "region=us-east* and db=*prod*"
}

measurements = Librato::Metrics.get_series :memory, query
```

```python
Not yet available
```

>Response:

```json
{
  "series":[
   {
     "tags":{
       "name":"prod",
       "region":"us-east",
       "db":"db-prod-1"
     },
     "measurements":[
       {
          "time":1476227520,
          "value":6.9
       }
     ]
   }
  ],
  "links":[],
  "resolution":60,
  "name":"memory"
}
```

#### HTTP Request

`GET https://metrics-api.librato.com/v1/measurements/:measurement`

This route returns streams of measurements for a given metric. The streams returned are based on the combination of time search and tag filter/aggregation parameters specified.

#### HTTP Response

In the response payload the top-level `measurements` key is replaced with the `series` keyword, similar to composite responses. The series are no longer keyed by source name, instead series is an array of measurement objects. Each measurement object contains either the grouping tag name/value or a set of tag/value pairs (depends if they use the `group_by` option).

Measurements are flattened to a single pair. The time is the Unix Time of the sample, which will be floored to the requested resolution. The value is based on the combination of the aggregation performed using the `summary_function` and `group_by` function parameters.

By default the series will be sorted by the ordering of their tag pairs.

#### Time search parameters

The following parameters control the period of time that is returned from a given query and the period of the individual samples.

Property | Definition
-------- | ----------
start_time | Unix Time of where to start the time search from. This parameter is optional if duration is specified.
end_time | Unix Time of where to end the search. This parameter is optional and defaults to current wall time.
duration | How far back to look in time, measured in seconds. This parameter can be used in combination with endtime to set a starttime N seconds back in time. It is an error to set starttime, endtime and duration.
resolution<br>`required` | Defines the resolution to return the data to in seconds. The returned data will be downsampled to this resolution and loaded from the appropriate underlying rollup resolution. An error will be returned if the requested resolution is not available during the requested time interval. The max value will be one week (604800 seconds).

#### Tag Search Parameters

The returned data streams can be filtered on the set of tags included on the original data streams.

Property | Definition
-------- | ----------
tags | A map of tag search patterns that limit the returned set of streams by simple wildcard patterns against tag values. Only streams matching the provided tag name/values are returned. Tags can be searched by AND, OR, and NOT conditions on their tag values. Specifying the same tag name multiple times with different values is an OR. Specifying different tag names performs an AND and prefixing a tag value search pattern with "!" negates the match.<br><br>A negation requires that the particular tag name is set on the data stream. It will not match streams that do not have the particular tag name set. See section below for how negation is handled.<br><br>Only tag values can be wildcard matches, tag names must be fully specified. It is not possible to perform wildcard matches against tag names.
tags_search | The `tag_search` parameter, which may NOT be specified with the tags parameter, defines a complex search query over a set of tags. It is provided to allow a more complex query pattern over the set of tag values than the tags parameter can provide. The grammar should be properly form-encoded to escape fields not appropriate for URL query parameters.

#### Tag Negation

When using the `tags` property you can perform two operations:

* Negate the values of a tag: This matches any data stream that contains the tag name, but does not match the negation pattern.

eg. `region=!us-east`

* Negate a tag name: This matches all data streams that do not contain the particular tag name.

eg. `!host`


#### Aggregation parameters

By default all matching data streams are returned in the response. The following parameters control how to aggregate data streams based on the tag values.

Property | Definition
-------- | ----------
group_by | Defines one or more tag names to group the returned results by. Any measurements with the same tag value for the given group_by tag names are aggregated using the group_by_func aggregation function. Each returned stream will include the grouped tags. If `group_by` is not specified, all streams are returned broken out by their tag values.<br><br>The group_by tags also define a filter for the returned results. Only streams that contain all of the group by tags are returned.<br><br>The special format of `group_by=*` will return all data streams aggregated together to a single stream. The response will not include any tag information.<br><br>Examples: `group_by=region`, `group_by=region,az`, `group_by=*`
group_by_function | Defines the aggregation function to group results by. This parameter is required if group_by is set. Options are: `sum`, `min`, `max`, & `mean`. Future: cardinality of aggregated streams.
summary_function | Defines the property of the metric to query. A metric has properties like: sum, count, min, max; this parameter defines which of the properties to read and represent in the payload.<br><br>Acceptable values are: `sum`, `min`, `max`, `count`, `mean`, `derivative`, `stddev`, & `all`. This parameter falls back to the persisted summary function of the metric, which by default is mean. If the parameter is set to `all` then the api will, instead of returning just one summarization, return multiple summarizations for each returned measure.<br><br>The summary function also defines the function used when downsampling data to a coarser granularity. The downsampling function is chosen as following given a summary function.

Note: If `summary_function` = all, `group_by` may not be specified.

### Measurement Pagination

>Response if more results are available for pagination:

```json
{
  "series": [

  ],
  "links": [
    {
      "rel": "next",
      "href": "https://metrics-api.librato.com/v1/measurements/foo?start_time=1234&resolution=3"
    }
  ]
}
```

>Response if there are no more results:

```json
{
  "series": [

  ],
  "links": [

  ]
}
```

When retrieving measurements, the response payload includes a pagination href if more results are available. This href will define how to invoke the API again to query the next set of data corresponding to the current query. The href may include an opaque "session key" as a parameter that will allow the API to store session data (like running accumulators) to continue a query without loss of data.

The response payload will have a top-level member called **links** that will contain a link member with a relative value of next. If there are no more results, the links section will not contain an entry for next.

Future iterations may add different components to the links list, so the consumer should check for the **next** entry specifically.

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
