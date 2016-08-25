# Charts

## Overview

A charts graphs one or more metrics in real time. In order to create a chart you will first need to build a [Space](#spaces). Each [Space](#spaces) accomodates multiple charts.

## Retrieve Chart by ID

>Definition

```
GET https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id
```

>Return chart by id and space id.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id'
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
chart = api.get_chart(chart_id, space_id)
for s in chart.streams:
  print(s.metric, s.source, s.group_function, s.summary_function)
```

>Response Code

```
200 OK
```

>Response Headers

```
** NOT APPLICABLE **
```

>Response Body

```json
{
  "id": 6637,
  "name": "CPU Usage",
  "type": "line",
  "streams": [
    {
      "id": 386291,
      "metric": "collectd.cpu.0.cpu.user",
      "type": "counter",
      "source": "*",
      "group_function": "average",
      "summary_function": "derivative"
    }
  ]
}
```

Returns a specific chart by its id and space id.

## Retrieve Charts in Space

>Definition

```
GET https://metrics-api.librato.com/v1/spaces/:id/charts
```

>List all charts in a Space with ID `129`.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/spaces/129/charts'
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
space = api.get_space(129)
charts = space.chart_ids
for c in charts:
   i = api.get_chart(c, space.id)
   for s in i.streams:
       print(s.id, s.metric, s.source, s.group_function, s.summary_function)
```

>Response Code

```
200 OK
```

>Response Headers

```
** NOT APPLICABLE **
```

>Response Body

```json
[
  {
    "id": 6637,
    "name": "CPU Usage",
    "type": "line",
    "streams": [
      {
        "id": 386291,
        "metric": "collectd.cpu.0.cpu.user",
        "type": "counter",
        "source": "*",
        "group_function": "average",
        "summary_function": "derivative"
      }
    ]
  },
  {
    "id": 6638,
    "name": "Free Memory",
    "type": "line",
    "streams": [
      {
        "id": 386292,
        "metric": "collectd.memory.memory.free",
        "type": "gauge",
        "source": "*",
        "group_function": "average",
        "summary_function": "average"
      }
    ]
  }
]
```

Return charts for a given space.

## Create a Chart

>Definition

```
POST https://metrics-api.librato.com/v1/spaces/:id/charts
```

>Example Request

>Create a line chart with various metric streams including their source(s) and 
group/summary functions:

```shell
curl \
-u <user>:<token> \
-d 'type=line' \
-d 'name=Server Temperature' \
-d 'streams[0][metric]=server_temp' \
-d 'streams[0][source]=app1' \
-d 'streams[1][metric]=environmental_temp' \
-d 'streams[1][source]=*' \
-d 'streams[1][group_function]=breakout' \
-d 'streams[1][summary_function]=average' \
-d 'streams[2][metric]=server_temp' \
-d 'streams[2][source]=%' \
-d 'streams[2][group_function]=average' \
-X POST \
'https://metrics-api.librato.com/v1/spaces/:id/charts'
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
space = api.get_space(123)
chart = api.create_chart(
    'Server Temperature', 
    space, 
    streams=[
        {'metric': 'server_temp', 'source': 'app1'}, 
        {'metric': 'environmental_temp', 'source': '*', 
        'group_function': 'average'},
        {'metric': 'server_temp', 'source': '%'}])
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
  "id": 123,
  "name": "Server Temperature",
  "type": "line",
  "streams": [
    {
      "metric": "server_temp",
      "source": "app1",
      "type": "gauge"
    },
    {
      "metric": "environmental_temp",
      "source": "*",
      "type": "gauge",
      "group_function": "average"
    },
    {
      "metric": "server_temp",
      "source": "%",
      "type": "gauge"
    }
  ]
}
```

>Example Request

>Add a composite metric to a chart

>NOTE: This will replace existing streams within the specified chart

```shell
curl \
  -u  $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'type=line' \
  -d 'streams[0][composite]=divide([sum(s("memory_total","prod.web*")),sum(s("memory_used","prod.web*"))])' \
  -X PUT \
  'https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id'
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
space = api.get_space(123)
charts = space.chart_ids
chart = api.get_chart(charts[0], space.id)
chart.new_stream(composite='divide([
  sum(s("memory_total","prod.web*")),
  sum(s("memory_used","prod.web*"))])')
chart.save()
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
streams | An array of hashes describing the metrics and sources to use for data in the chart.
type | Indicates the type of chart. Must be one of line, stacked, or bignumber (default to line)
min | The minimum display value of the chart's Y-axis
max | The maximum display value of the chart's Y-axis
label | The Y-axis label
related_space | The ID of another space to which this chart is related

### Stream Properties

Parameter | Definition
--------- | ----------
metric | Name of metric
source | Name of source or * to include all sources. This field will also accept specific wildcard entries. For example us-west-\-app* will match us-west-21-app but not us-west-12-db. Use % to specify a dynamic source that will be provided after the instrument or dashboard has loaded, or in the URL.
composite | A composite metric query string to execute when this stream is displayed. This can not be specified with a metric, source or group_function.
group_function | How to process the results when multiple sources will be returned. Value must be one of: average, sum, min, max, breakout. If average, sum, min, or max, a single line will be drawn representing the function applied over all sources. If the function is breakout, a separate line will be drawn for each source. If this property is not supplied, the behavior will default to average.
summary_function | When visualizing complex measurements or a rolled-up measurement, this allows you to choose which statistic to use. If unset, defaults to "average". Valid options are one of: [max, min, average, sum, count].
downsample_function | This allows you to choose which statistic to use during [roll-ups](https://www.librato.com/docs/kb/visualize/faq/rollups_retention_resolution.html#roll-ups) (for composite metrics only). If unset, defaults to "average". Valid options are one of: [max, min, average, sum, count].
color | Sets a color to use when rendering the stream. Must be a seven character string that represents the hex code of the color e.g. #52D74C.
name | A display name to use for the stream when generating the tooltip.
units_short | Unit value string to use as the tooltip label.
units_long | String value to set as they Y-axis label. All streams that share the same units_long value will be plotted on the same Y-axis.
min | Theoretical minimum Y-axis value.
max | Theoretical maximum Y-axis value.
transform_function | Linear formula to run on each measurement prior to visualizaton.
period | An integer value of seconds that defines the period this stream reports at. This aids in the display of the stream and allows the period to be used in stream display transforms.

## Update Chart Attributes

>Definition

```
PUT https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id
```

>Example Request

>Update a chart name to `Temperature`:

```shell
curl \
  -u <user>:<token> \
  -d 'name=Temperature' \
  -X PUT \
  'https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id'
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
space = api.get_space(123)
charts = space.chart_ids
chart = api.get_chart(charts[0], space.id)
chart.name = 'Temperature'
chart.save()
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

Updates attributes of a specific chart.

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
streams | An array of hashes describing the metrics and sources to use for data in the chart.
type | Indicates the type of chart. Must be one of line or stacked (default to line)
min | The minimum display value of the chart's Y-axis
max | The maximum display value of the chart's Y-axis
label | The Y-axis label
related_space | The ID of another space to which this chart is related

### Stream Properties

Property | Definition
-------- | ----------
metric | Name of metric
source | Name of source or * to include all sources. This field will also accept specific wildcard entries. For example us-west-\-app* will match us-west-21-app but not us-west-12-db. Use % to specify a dynamic source that will be provided after the instrument or dashboard has loaded, or in the URL.
composite | A composite metric query string to execute when this stream is displayed. This can not be specified with a metric, source or group_function.
group_function | How to process the results when multiple sources will be returned. Value must be one of: average, sum, min, max, breakout. If average, sum, min, or max, a single line will be drawn representing the function applied over all sources. If the function is breakout, a separate line will be drawn for each source. If this property is not supplied, the behavior will default to average.
summary_function | When visualizing complex measurements or a rolled-up measurement, this allows you to choose which statistic to use. If unset, defaults to "average". Valid options are one of: [max, min, average, sum, count].
downsample_function | This allows you to choose which statistic to use during [roll-ups](https://www.librato.com/docs/kb/visualize/faq/rollups_retention_resolution.html#roll-ups) (for composite metrics only). If unset, defaults to "average". Valid options are one of: [max, min, average, sum, count].
color | Sets a color to use when rendering the stream. Must be a seven character string that represents the hex code of the color e.g. #52D74C.
name | A display name to use for the stream when generating the tooltip.
units_short | Unit value string to use as the tooltip label.
units_long | String value to set as they Y-axis label. All streams that share the same units_long value will be plotted on the same Y-axis.
min | Theoretical minimum Y-axis value.
max | Theoretical maximum Y-axis value.
transform_function | Linear formula to run on each measurement prior to visualizaton.
period | An integer value of seconds that defines the period this stream reports at. This aids in the display of the stream and allows the period to be used in stream display transforms.

## Delete Chart

>Definition

```
DELETE https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id
```

>Delete the chart ID 123.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id'
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
space = api.get_space(123)
charts = space.chart_ids
chart = api.get_chart(charts[0], space_id)
chart.delete()
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

Delete the specified chart.
