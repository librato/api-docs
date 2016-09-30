# Measurements

<aside class="notice">Note: Measurements are only available in the Tags Beta. Please <a href="mailto: support@librato.com" target="_top">contact Librato support</a> to join the beta.</aside>

Measurements represent the individual time-series samples sent to the Librato service. These measurements are created and may be accessed programatically through a set of RESTful API calls.

Measurements are associated with: a metric, one or more tag pairs, and a point in time. Each measurement has a value that represents an observation at one point in time. The value of a measurement will typically vary between some minimum or maximum value, for example: CPU usage moving from 0% -> 100%, the amount of disk space on a cloud server, or the current value of $AAPL.

### Measurement Properties

>The following psuedo code demonstrates how to compute the current mean (`stddev_m2`) over a set of samples:

```
class StandardDeviation {
  long count = 0
  double sum = 0.0
  double stddev_m2 = 0.0

  void add_sample(double x) {
    double delta = x - mean()

    count++
    sum += x
    stddev_m2 += delta (x - mean())
  }

  double mean() {
    return count < 1 ? 0.0 : sum / count
  }

  void submit(client) {
    client.send({"count": count,
                 "sum": sum,
                 "stddev_m2": sttdev_m2})
  }
}
```

The general properties of a measurement are described below. The [documentation on submitting measurements](#create-a-measurement) includes a full overview of all acceptable parameters.

Property | Definition
-------- | ----------
name | The unique identifying name of the property being tracked. The metric name is used both to create new measurements and query existing measurements.
tags | A set of name=value tag pairs that describe the particular data stream. Tags behave as extra dimensions that data streams can be filtered and aggregated along. Examples include the region a server is located in, the size of a cloud instance or the country a user registers from. The full set of unique tag pairs defines a single data stream.
value | The numeric value of a single measured sample.
time | Unix Time (epoch seconds). This defines the time that a measurement is recorded at. It is useful when sending measurements from multiple sources to align them on a given time boundary, eg. time=floor(Time.now, 60) to align samples on a 60 second tick.
period | Define the period for the metric. This will be persisted for new metrics and used as the metric period for metrics marked for Service-Side Aggregation.

### Standard deviation

There are two approaches to providing a standard deviation for sample sets:

Use a custom standard deviation algorithm and submit the resulting standard deviation calculation with your sample set.

Use the online algorithm to compute a running standard deviation and submit the current mean to Librato. When a request for the standard deviation of a metric series is requested (summary_function set to stddev) the API will calculate the resulting standard deviation. This algorithm is preferred over the sum of squares approach, the default in the legacy Librato metrics API, since it doesn't suffer from the cancellation problems that sum of squares does.

This method is preferred over sending precomputed standard deviation values because samples that are downsampled or rolled up for historical retention can be aggregated to maintain an accurate standard deviation calculation over the period of the samples.

## Create a Measurement

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

>This will result in two data streams, `metric=cpu, {region=us-west,hostname=web-prod-3}` and `metric=memory, {region=us-west,hostname=web-prod-3}`.

```json
{
  "time": 1421530163,
  "tags": {
    "region": "us-west",
    "hostname": "web-prod-3"
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
}
```

>**Embedded Measurement Tags**

>This example payload demonstrates mixing top-level tags with per-measurement tags. The cpu metric strips the hostname tag from the data stream while the memory metric actually adds two additional tag names.

>This will result in the data streams `metric=cpu, {region=us-west}` and `metric=memory, {region=us-east, db=db-prod-1, hostname=web-prod-3}`.

```json
{
  "time": 1421530163,
  "tags": {
    "region": "us-west",
    "hostname": "web-prod-3"
  },
  "measurements": [
    {
      "name": "cpu",
      "value": 4.5,
      "tags": {
        "hostname": null
      }
    },
    {
      "name": "memory",
      "sum": 34.5,
      "count": 5,
      "tags": {
        "region": "us-east",
        "db": "db-prod-1"
      }
    }
  ]
}
```

>**Full Measurement Sample**

>This shows an example of a single measurement sample (for brevity) that contains a full summary statistics fields, includes embedded tag names, and includes a metric attribute (don't enable SSA) that is saved when the initial metric (cpu) is created. It shows how measurements can contain multiple fields.

```json
{
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
}
```

#### Individual Sample Parameters

The request must include at least one measurement. Measurements are collated under the top-level parameter **measurements**. The minimum required fields for a measurement are:

Parameter | Definition
--------- | ----------
name | The unique identifying name of the property being tracked. The metric name is used both to create new measurements and query existing measurements. Must be 255 or fewer characters, and may only consist of 'A-Za-z0-9.:-_'. The metric namespace is case insensitive.
value | The numeric value of a single measured sample.

#### Global or per-sample parameters

In addition, the following parameters can be specified to further define the measurement sample. They may be set at the individual measurement level or at the top-level. The top-level value is used unless the same parameter is set at an individual measurement.

Parameter | Definition
--------- | ----------
time | Unix Time (epoch seconds). This defines the time that a measurement is recorded at. It is useful when sending measurements from multiple sources to align them on a given time boundary, eg. time=floor(Time.now, 60) to align samples on a 60 second tick.
tags | A set of name=value tag pairs that describe the particular data stream. Tags behave as extra dimensions that data streams can be filtered and aggregated along. Examples include the region a server is located in, the size of a cloud instance or the country a user registers from. The full set of unique tag pairs defines a single data stream.<br><br>Tags are merged between the top-level tags and any per-measurement tags, see the section Tag Merging for details.<br><br>If no tag pairs are specified in the payload, a default tag pair of source=unassigned will be applied.
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

**NOTE**: The [optional parameters](#update-metric) listed in the metrics PUT operation can be used with POST operations, but they will be ignored if the metric already exists. To update existing metrics, please use the PUT operation.

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

#### HTTP Request

>Lookup by the tags matching `region=us*` and `hostname=*prod`, grouped by region.

```
GET /v1/measurements/foo?tags[region]=us-*&tags[hostname]=*prod&group_by=region&group_by_function=sum
```

```json
{
  "series": [
    {
      "tags": {
        "region": "us-east"
      },
      "measurements": [
        {
          "time": 12345,
          "value": 4.5
        },
        {
          "time": 12346,
          "value": 5.6
        }
      ]
    },
    {
      "tags": {
        "region": "us-west"
      },
      "measurements": [
        {
          "time": 12345,
          "value": 4.5
        },
        {
          "time": 12346,
          "value": 5.6
        }
      ]
    }
  ]
}
```

>Lookup by tags matching `region=us*` and `hostname=*prod`, no grouping.

```json
{
  "series": [
    {
      "tags": {
        "region": "us-west",
        "hostname": "db-1-prod"
      },
      "measurements": [
        {
          "time": 12345,
          "value": 4.5
        },
        {
          "time": 12346,
          "value": 5.6
        }
      ]
    },
    {
      "tags": {
        "region": "us-west",
        "hostname": "db-2-prod"
      },
      "measurements": [
        {
          "time": 12345,
          "value": 4.5
        },
        {
          "time": 12346,
          "value": 5.6
        }
      ]
    }
  ]
}
```

`GET https://metrics-api.librato.com/v1/measurements/:measurement`

This route returns streams of measurements for a given metric. The streams returned are based on the combination of time search and tag filter/aggregation parameters specified.

#### Lookup parameters

The parameters for reading measurement streams from the `/v1/measurements` route differs from the legacy `/v1/metrics` route.

#### Time search parameters

The following parameters control the period of time that is returned from a given query and the period of the individual samples.

Property | Definition
-------- | ----------
start_time | Unix Time of where to start the time search from. This parameter is optional if duration is specified.
end_time | Unix Time of where to end the search. This parameter is optional and defaults to current wall time.
duration | How far back to look in time, measured in seconds. This parameter can be used in combination with endtime to set a starttime N seconds back in time. It is an error to set starttime, endtime and duration.
resolution<br>`required` | Defines the resolution to return the data to in seconds. The returned data will be downsampled to this resolution and loaded from the appropriate underlying rollup resolution. An error will be returned if the requested resolution is not available during the requested time interval. The max value will be one week (604800 seconds).

### Tag Search Parameters

>Using the `tags` parameter to retrieve all `prod*` hosts in US regions:

```
tags[region]=us-*&tags[hostname]=prod
```

>How to retrieve all `prod*` hosts in either `us-east-1` OR `eu-west-1`:

```
tags[region]=us-east-1&tags[region]=eu-west-1&tags[hostname]=prod*
```

>How to use the `tag_search` parameter:

```
* region=us-east-1
* region=us-east* and host=slingbot
* region=us-east* and host=slingbot*` or `region=us-west-* and host=!alerts*
```

The returned data streams can be filtered on the set of tags included on the original data streams.

Property | Definition
-------- | ----------
tags | A map of tag search patterns that limit the returned set of streams by simple wildcard patterns against tag values. Only streams matching the provided tag name/values are returned. Tags can be searched by AND, OR, and NOT conditions on their tag values. Specifying the same tag name multiple times with different values is an OR. Specifying different tag names performs an AND and prefixing a tag value search pattern with "!" negates the match.<br><br>A negation requires that the particular tag name is set on the data stream. It will not match streams that do not have the particular tag name set. See section below for how negation is handled.<br><br>Only tag values can be wildcard matches, tag names must be fully specified. It is not possible to perform wildcard matches against tag names.
tag_search | The `tag_search` parameter, which may NOT be specified with the tags parameter, defines a complex search query over a set of tags. It is provided to allow a more complex query pattern over the set of tag values than the tags parameter can provide. The grammar should be properly form-encoded to escape fields not appropriate for URL query parameters. The full grammar is specified here, but a few examples are (form-encoding is absent for clarity):

### Aggregation parameters

>Here are some example on how to utilize the `summary` parameter:

```
* SF:min => min
* SF:max => max
* SF:mean => mean
* SF:all others => sum
```

>If `summary_function` = `all`, the api will, instead of returning just one summarization, return multiple summarizations for each returned measure. The summaries returned are:

```
* value (mean)
* count
* sum
* min
* max
* last
* stddev
```

>Note: If `summary_function` = all, `group_by` may not be specified.

By default all matching data streams are returned in the response. The following parameters control how to aggregate data streams based on the tag values.

Property | Definition
-------- | ----------
group_by | Defines one or more tag names to group the returned results by. Any measurements with the same tag value for the given groupby tag names are aggregated using the groupbyfunc aggregation function. Each returned stream will include the grouped tags. If `groupby` is not specified, all streams are returned broken out by their tag values.<br><br>The group_by tags also define a filter for the returned results. Only streams that contain all of the group by tags are returned.<br><br>The special format of `group_by=*` will return all data streams aggregated together to a single stream. The response will not include any tag information.<br><br>Examples: `groupby=region`, `groupby=region,az`, `group_by=*`
group_by_function | Defines the aggregation function to group results by. This parameter is required if group_by is set. Options are: sum, min, max, mean. Future: cardinality of aggregated streams.
summary_function | Defines the property of the metric to query. A metric has properties like: sum, count, min, max; this parameter defines which of the properties to read and represent in the payload. Acceptable values are: sum, min, max, count, mean, derivative, stddev. This parameter falls back to the persisted summary function of the metric, which by default is mean. The value derivative will return a derivative over the last value over every sample.<br><br>The summary function also defines the function used when downsampling data to a coarser granularity. The downsampling function is chosen as following given a summary function(SF):

### Tag Negation

This section details the handling of negating tags in lookups. There are several scenarios to consider, so let’s start with several data streams with their corresponding tags:

* **Stream #1**: `region=us-east host=db-1-prod`
* **Stream #2**: `region=us-east host=db-2-prod`
* **Stream #3**: `region=us-west host=db-3-prod`
* **Stream #4**: `region=us-west host=db-stg`
* **Stream #5**: `region=us-east name=bubbles`

#### Negate matched values of a tag name

This matches any data stream that contains the tag name, but does not match the negation pattern.

* `region=!us-east`: Matches streams #3 and #4
* `host=!db*prod`: Matches stream #4

#### Negate existence of a tag name

Match all data streams that do not contain the particular tag name.

* `!host`: Matches stream #5
* `!name`: Matches streams #1, #2, #3, #4

#### Only streams that don’t have a particular

You can combine the previous two approaches to return streams that just don’t have particular name/value pair.

* `!host OR host=!db*prod`: Matches streams #4 and #5

#### Form Encoding

To form encode the negation `!host` (streams that contain the `host` tag), we’ll use a format `tags[!host]=1`. It is not possible to have `!host=<value>` in with this, so there shouldn’t be a concern that the 1 would be matched against a string.

### Measurement Pagination

>Pagination Example:

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

>If there are no more results:

```json
{
  "series": [

  ],
  "links": [

  ]
}
```

The response payload will include a pagination href. This href will define how to invoke the API again to query the next set of data corresponding to the current query. The href may include an opaque "session key" as a parameter that will allow the API to store session data (like running accumulators) to continue a query without loss of data.

The response payload will have a top-level member called `links` that will contain a link member with a relative value of next. If there are no more results, the links section will not contain an entry for next.

Future iterations may add different components to the links list, so the consumer should check for the "next" entry specifically.

### Response

Top-level `measurements` key is replaced with the `series` keyword, similar to composite responses. The series are no longer keyed by source name, instead series is an array of measurement objects. Each measurement object contains either the grouping tag name/value or a set of tag/value pairs (depends if they use the `group_by` option).

Measurements are flattened to a single pair. The time is the Unix Time of the sample, which will be floored to the requested resolution. The value is based on the combination of the aggregation performed using the `summary_function` and `groupby` function parameters.

The series will be sorted by the ordering of their tag pairs.
