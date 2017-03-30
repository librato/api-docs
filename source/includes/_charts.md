# Charts

A charts graphs one or more metrics in real time. In order to create a chart you will first need to build a [Space](#spaces). Each [Space](#spaces) accommodates multiple charts.

## Create a Chart

>Create a line chart with various metric streams including their tags(s) and group/summary functions:

```shell
curl \
-u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
-H "Content-Type: application/json" \
-d '{
  "type": "line",
  "name": "CPU Usage",
  "streams": [
    {
      "metric": "librato.cpu.percent.idle",
      "tags": [{"name": "environment", "values": ["*"]}]
    },
    {
      "metric": "librato.cpu.percent.user",
      "tags": [{"name": "environment", "values": ["prod"]}]
    }
  ]
}' \
-X POST \
'https://metrics-api.librato.com/v1/spaces/:space_id/charts'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('email', 'token')
space = api.get_space(123)
linechart = api.create_chart(
  'cities MD line chart',
  space,
  streams=[
    {
      "metric": "librato.cpu.percent.idle",
      "tags": [{"name": "environment", "values": ["*"]}]
    },
    {
      "metric": "librato.cpu.percent.user",
      "tags": [{"name": "environment", "values": ["prod"]}]
    }
  ]
)
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/spaces/123
```

>Response Body

```json
{
  "id": 1234567,
  "name": "CPU Usage",
  "type": "line",
  "streams": [
    {
      "id": 27032885,
      "metric": "librato.cpu.percent.idle",
      "type": "gauge",
      "tags": [
        {
          "name": "environment",
          "values": [
            "*"
          ]
        }
      ]
    },
    {
      "id": 27032886,
      "metric": "librato.cpu.percent.user",
      "type": "gauge",
      "tags": [
        {
          "name": "environment",
          "values": [
            "prod"
          ]
        }
      ]
    }
  ],
  "thresholds": null
}
```

>Create a Big Number chart with a threshold of > 90:

```shell
curl \
-u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
-H "Content-Type: application/json" \
-d '{
  "type": "bignumber",
  "name": "CPU Usage",
  "streams": [
    {
      "metric": "librato.cpu.percent.user",
      "tags": [{"name": "environment", "values": ["prod"]}]
    }
  ],
  "thresholds":[
    {
      "operator":">",
      "value":90,
      "type":"red"
    }
  ]
}' \
-X POST \
'https://metrics-api.librato.com/v1/spaces/:space_id/charts'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('email', 'token')
space = api.get_space(123)
linechart = api.create_chart(
  'CPU Usage',
  space,
  type='bignumber',
  streams=[
    {
      "metric": "librato.cpu.percent.user",
      "tags": [{"name": "environment", "values": ["prod"]}]
    }
  ],
  thresholds=[
    {
      "operator": ">",
      "value": 90,
      "type": "red"
    }
  ]
)
```

When creating a new chart you can specify any metrics to include.

#### HTTP Request

`POST https://metrics-api.librato.com/v1/spaces/:id/charts`

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Parameters

Parameter | Definition
--------- | ----------
name | Title of the chart when it is displayed.
streams | An array of hashes describing the metrics and tags to use for data in the chart.
type | Indicates the type of chart. Must be one of `line`, `stacked`, or `bignumber` (default to line)
min | The minimum display value of the chart's Y-axis
max | The maximum display value of the chart's Y-axis
label | The Y-axis label
related_space | The ID of another space to which this chart is related
thresholds | required when creating a BigNumber chart. When creating a threshold you will need to provide the `operator` (>, <, or =), the `value` to trigger the threshold, and the `type` (red or yellow) which specifies the color for the BigNumber chart to display when the criteria is met.

### Stream Properties

Parameter | Definition
--------- | ----------
metric | Name of metric
tags | A set of key/value pairs that describe the particular data stream. Tags behave as extra dimensions that data streams can be filtered and aggregated along. The value field will also accept specific wildcard entries. For example `us-west-*-app` will match `us-west-21-app` but not `us-west-12-db`.<br><br>You can create a dynamic tag by specifying `"tags":"%"`. This allows a tag to be provided after the space has loaded, or in the URL.<br><br>The full set of unique tag pairs defines a single data stream.
composite | A composite metric query string to execute when this stream is displayed. This can not be specified with a metric, tag or group_function.
group_function | How to process the results when multiple streams will be returned. Value must be one of: average, sum, min, max, breakout. If average, sum, min, or max, a single line will be drawn representing the function applied over all tags. If the function is breakout, a separate line will be drawn for the values in the highest tag cardinality. If this property is not supplied, the behavior will default to average.
summary_function | When visualizing complex measurements or a rolled-up measurement, this allows you to choose which statistic to use. If unset, defaults to "average". Valid options are one of: [max, min, average, sum, count].
downsample_function | This allows you to choose which statistic to use during [roll-ups](https://www.librato.com/docs/kb/visualize/faq/rollups_retention_resolution/#roll-ups) (for composite metrics only). If unset, defaults to "average". Valid options are one of: [max, min, average, sum, count].
color | Sets a color to use when rendering the stream. Must be a seven character string that represents the hex code of the color e.g. #52D74C.
name | A display name to use for the stream when generating the tooltip.
units_short | Unit value string to use as the tooltip label.
units_long | String value to set as they Y-axis label. All streams that share the same units_long value will be plotted on the same Y-axis.
min | Theoretical minimum Y-axis value.
max | Theoretical maximum Y-axis value.
transform_function | Linear formula to run on each measurement prior to visualization.
period | An integer value of seconds that defines the period this stream reports at. This aids in the display of the stream and allows the period to be used in stream display transforms.

## Retrieve a Chart

>Return chart by id and space id.

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('user', 'token')
chart = api.get_chart(chart_id, space_id)
for s in chart.streams:
  print(s.metric, s.tags, s.group_function, s.summary_function)
```

>Response Code

```
200 OK
```

>Response Body

```json
{
  "id": 3700969,
  "name": "CPU Usage",
  "type": "line",
  "streams": [
    {
      "id": 27003258,
      "metric": "librato.cpu.percent.idle",
      "type": "gauge",
      "tags": [
        {
          "name": "region",
          "values": [
            "us-east-1"
          ]
        }
      ],
    }
  ],
  "thresholds": null
}
```

Returns a specific chart by its id and space id.

#### HTTP Request

`GET https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id`


## Update a Chart

>Update a chart name to `Temperature`:

```shell
curl \
-u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
-H "Content-Type: application/json" \
-d '{
  "type": "line",
  "name": "Temperature"
}' \
-X PUT \
'https://metrics-api.librato.com/v1/spaces/:space_id/charts/:chart_id'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('user', 'token')
space = api.get_space(123)
charts = space.chart_ids
chart = api.get_chart(charts[0], space.id)
chart.name = 'Temperature'
chart.save()
```

>Response Code

```
200 OK
```

>Response Body

```json
{
  "id": 3700969,
  "name": "Temperature",
  "type": "line",
  "streams": [
    {
      "id": 27003258,
      "metric": "collectd.cpu.0.cpu.user",
      "type": "gauge",
      "tags": [
        {
          "name": "region",
          "values": [
            "us-east-1"
          ]
        }
      ],
    }
  ],
  "thresholds": null
}
```

>How to add a composite metric to a chart

>NOTE: This will replace existing streams within the specified chart

```shell
curl \
-u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
-H "Content-Type: application/json" \
-d '{
  "type": "line",
  "streams": [
    {
      "composite": "divide([sum(s(\"librato.cpu.percent.idle\",{\"environment\":\"*\"})),sum(s(\"librato.cpu.percent.user\",{\"environment\":\"*\"}))])"
    }
  ]
}' \
-X POST \
'https://metrics-api.librato.com/v1/spaces/:space_id/charts/:chart_id'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('user', 'token')
space = api.get_space(123)
charts = space.chart_ids
chart = api.get_chart(charts[0], space.id)
chart.new_stream(composite="divide([sum(s(\"librato.cpu.percent.idle\",{\"environment\":\"*\"})),"
"sum(s(\"librato.cpu.percent.user\",{\"environment\":\"*\"}))])")
chart.save()
```

>Response Body

```json
{
   "id":1234567,
   "name":"CPU Usage",
   "type":"line",
   "streams":[
      {
         "id":27037351,
         "composite":"divide([sum(s(\"librato.cpu.percent.idle\",{\"environment\":\"*\"})),sum(s(\"librato.cpu.percent.user\",{\"environment\":\"*\"}))])",
         "type":"composite"
      }
   ],
   "thresholds":null
}
```

Updates attributes of a specific chart. In order to update the metrics associated with a chart you will need to view the example under [Create a Chart](#create-a-chart), which demonstrates overwriting an existing chart with new metrics.

#### HTTP Request

`PUT https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id`

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Parameters

Parameter | Definition
--------- | ----------
name | Title of the chart when it is displayed.
streams | An array of hashes describing the metrics and tags to use for data in the chart.
type | Indicates the type of chart. Must be one of `line`, `stacked`, or `bignumber` (default to line)
min | The minimum display value of the chart's Y-axis
max | The maximum display value of the chart's Y-axis
label | The Y-axis label
related_space | The ID of another space to which this chart is related
thresholds | required when creating a BigNumber chart. When creating a threshold you will need to provide the `operator` (>, <, or =), the `value` to trigger the threshold, and the `type` (red or yellow) which specifies the color for the BigNumber chart to display when the criteria is met.

### Stream Properties

Property | Definition
-------- | ----------
metric | Name of metric
tags | A set of key/value pairs that describe the particular data stream. Tags behave as extra dimensions that data streams can be filtered and aggregated along. The value field will also accept specific wildcard entries. For example `us-west-*-app` will match `us-west-21-app` but not `us-west-12-db`.<br><br>You can create a dynamic tag by specifying `"tags":"%"`. This allows a tag to be provided after the space has loaded, or in the URL.<br><br>The full set of unique tag pairs defines a single data stream.
composite | A composite metric query string to execute when this stream is displayed. This can not be specified with a metric, tag or group_function.
group_function | How to process the results when multiple streams will be returned. Value must be one of: average, sum, min, max, breakout. If average, sum, min, or max, a single line will be drawn representing the function applied over all tags. If the function is breakout, a separate line will be drawn for the values in the highest tag cardinality. If this property is not supplied, the behavior will default to average.
summary_function | When visualizing complex measurements or a rolled-up measurement, this allows you to choose which statistic to use. If unset, defaults to "average". Valid options are one of: [max, min, average, sum, count].
downsample_function | This allows you to choose which statistic to use during [roll-ups](https://www.librato.com/docs/kb/visualize/faq/rollups_retention_resolution/#roll-ups) (for composite metrics only). If unset, defaults to "average". Valid options are one of: [max, min, average, sum, count].
color | Sets a color to use when rendering the stream. Must be a seven character string that represents the hex code of the color e.g. #52D74C.
name | A display name to use for the stream when generating the tooltip.
units_short | Unit value string to use as the tooltip label.
units_long | String value to set as they Y-axis label. All streams that share the same units_long value will be plotted on the same Y-axis.
min | Theoretical minimum Y-axis value.
max | Theoretical maximum Y-axis value.
transform_function | A linear formula that is run on each measurement prior to visualization. Useful for translating between different units (e.g. Fahrenheit -> Celsius) or scales (e.g. Microseconds -> Milliseconds). The formula may only contain: numeric characters, whitespace, parentheses, the letter x, and approved mathematical operators (’+’, ’-’, ’’, ’/’). The regular expression used is `/^[\dxp()+-\/ ]+$/`. The formula is run on each measurement by substituting x with a given measurement’s value and p (if present) with the number of seconds in the period the measurement covers. **DO NOT MULTIPLY x BY ITSELF** (e.g. x*x). Nonlinear functions will not apply correctly against the automatically generated aggregate values and produce false data.
period | An integer value of seconds that defines the period this stream reports at. This aids in the display of the stream and allows the period to be used in stream display transforms.

## Delete a Chart

>Delete the chart ID 123.

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X DELETE \
  'https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('user', 'token')
space = api.get_space(123)
charts = space.chart_ids
chart = api.get_chart(charts[0], space_id)
chart.delete()
```
>Response Code

```
204 No Content
```

Delete the specified chart.

#### HTTP Request

`DELETE https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id`

## List all Charts in Space

>List all charts in a Space with ID `129`.

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/spaces/129/charts'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('user', 'token')
space = api.get_space(129)
charts = space.chart_ids
for c in charts:
   i = api.get_chart(c, space.id)
   for s in i.streams:
       print(s.id, s.tags, s.source, s.group_function, s.summary_function)
```

>Response Code

```
200 OK
```

>Response Body

```json
[
  {
    "id": 1234567,
    "name": "CPU Usage",
    "type": "line",
    "streams": [
      {
        "id": 27035309,
        "metric": "librato.cpu.percent.idle",
        "type": "gauge",
        "tags": [
          {
            "name": "environment",
            "values": [
              "*"
            ]
          }
        ]
      },
      {
        "id": 27035310,
        "metric": "librato.cpu.percent.user",
        "type": "gauge",
        "tags": [
          {
            "name": "environment",
            "values": [
              "prod"
            ]
          }
        ]
      }
    ],
    "thresholds": null
  }
]
```

Return charts for a given space.

#### HTTP Request

`GET https://metrics-api.librato.com/v1/spaces/:id/charts`
