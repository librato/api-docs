# Spaces

## Overview

Spaces contain a collection of charts that graph one or more metrics in real time.

### Space Properties

Property | Definition
-------- | ----------
id | Each space has a unique numeric ID
name | Unique name for space

## Retrieve All Spaces

>Definition

```
GET https://metrics-api.librato.com/v1/spaces
```

>Return all spaces owned by the user with name matching ops.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/spaces?name=ops'
```

>Response Code

```
200 OK
```

>Response Body

```json
{
  "query": {
    "found": 1,
    "length": 1,
    "offset": 0,
    "total": 15
  },
  "spaces": [
    {
      "id": 4,
      "name": "staging_ops"
    }
  ]
}
```

Returns all spaces created by the user.

### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination). Specific to spaces, the default value of the `orderby` pagination parameter is `name`, and the permissible values of the `orderby` pagination parameter are: `name`.

Parameter | Definition
--------- | ----------
name | Search by name of the space.

## Retrieve Details of Space

>Definition

```
GET https://metrics-api.librato.com/v1/spaces/:id
```

>Return the space id 129:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/spaces/129'
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
  "name": "CPUs",
  "id": 129,
  "charts": [
    {
      "id": 915
    },
    {
      "id": 1321
    },
    {
      "id": 47842
    },
    {
      "id": 922
    }
  ]
}
```

Returns the details of a specific space.

## Retrieve Chart of Space

>Definition

```
GET https://metrics-api.librato.com/v1/spaces/:id/charts
```

>Return all charts related to the space.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/spaces/:id/charts'
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

```
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

>Response Code

```
200 OK
```

>Response Headers

```
** NOT APPLICABLE **
```

>Response Body

```curl
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

## Create a Space

>Definition

```
POST https://metrics-api.librato.com/v1/spaces
```

>Create a space with name CPUs.

>Using Form-Encoded params

```shell
curl \
  -u <user>:<token> \
  -d 'name=CPUs' \
  -X POST \
  'https://metrics-api.librato.com/v1/spaces'
```

>Using JSON

```
{
  "name": "CPUs"
}
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/spaces/129
```

>Response Body

```curl
{
  "name": "CPUs",
  "id": 129,
  "charts": [
    {
      "id": 915
    },
    {
      "id": 1321
    },
    {
      "id": 47842
    },
    {
      "id": 922
    }
  ]
}
```

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

## Create a Chart

>Definition

```
POST https://metrics-api.librato.com/v1/spaces/:id/charts
```

>POST Request Body (JSON)

```json
{
  "name": "Server Temperature",
  "type": "line",
  "streams": [
    {
      "metric": "server_temp",
      "source": "app1"
    },
    {
      "metric": "environmental_temp",
      "source": "*",
      "group_function": "breakout",
      "summary_function": "average"
    },
    {
      "metric": "server_temp",
      "source": "%",
      "group_function": "average"
    }
  ]
}
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

Parameter | Definition
--------- | ----------
metric | Name of metric
source | Name of source or * to include all sources. This field will also accept specific wildcard entries. For example us-west-\-app* will match us-west-21-app but not us-west-12-db. Use % to specify a dynamic source that will be provided after the instrument or dashboard has loaded, or in the URL.
composite | A composite metric query string to execute when this stream is displayed. This can not be specified with a metric, source or group_function.
group_function | How to process the results when multiple sources will be returned. Value must be one of average, sum, breakout. If average or sum, a single line will be drawn representing the average or sum (respectively) of all sources. If the group_function is breakout, a separate line will be drawn for each source. If this property is not supplied, the behavior will default to average.
summary_function | When visualizing complex measurements or a rolled-up measurement, this allows you to choose which statistic to use. If unset, defaults to "average". Valid options are one of: [max, min, average, sum, count].
color | Sets a color to use when rendering the stream. Must be a seven character string that represents the hex code of the color e.g. #52D74C.
name | A display name to use for the stream when generating the tooltip.
units_short | Unit value string to use as the tooltip label.
units_long | String value to set as they Y-axis label. All streams that share the same units_long value will be plotted on the same Y-axis.
min | Theoretical minimum Y-axis value.
max | Theoretical maximum Y-axis value.
transform_function | Linear formula to run on each measurement prior to visualizaton.
period | An integer value of seconds that defines the period this stream reports at. This aids in the display of the stream and allows the period to be used in stream display transforms.

## Modify a Space

>Definition

```
PUT https://metrics-api.librato.com/v1/spaces/:id
```

>Change the name of the space to CPUs.

>Using Form-Encoded params

```shell
curl \
  -u <user>:<token> \
  -d 'name=CPUs' \
  -X PUT \
  'https://metrics-api.librato.com/v1/spaces/:id'
```

>Using JSON

```curl
{
  "name": "CPUs"
}
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

Modifies a space by changing its name.

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

## Update Chart Attributes

>Definition

```
PUT https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id
```

>Update a chart name to "Server Temperature"

```shell
curl \
  -u <user>:<token> \
  -d 'name=Server Temperature' \
  -X PUT \
  'https://metrics-api.librato.com/v1/spaces/:id/charts/:chart_id'
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
group_function | How to process the results when multiple sources will be returned. Value must be one of average, sum, breakout. If average or sum, a single line will be drawn representing the average or sum (respectively) of all sources. If the group_function is breakout, a separate line will be drawn for each source. If this property is not supplied, the behavior will default to average.
summary_function | When visualizing complex measurements or a rolled-up measurement, this allows you to choose which statistic to use. If unset, defaults to "average". Valid options are one of: [max, min, average, sum, count].
color | Sets a color to use when rendering the stream. Must be a seven character string that represents the hex code of the color e.g. #52D74C.
name | A display name to use for the stream when generating the tooltip.
units_short | Unit value string to use as the tooltip label.
units_long | String value to set as they Y-axis label. All streams that share the same units_long value will be plotted on the same Y-axis.
min | Theoretical minimum Y-axis value.
max | Theoretical maximum Y-axis value.
transform_function | Linear formula to run on each measurement prior to visualizaton.
period | An integer value of seconds that defines the period this stream reports at. This aids in the display of the stream and allows the period to be used in stream display transforms.

## Delete Space

>Definition

```
DELETE https://metrics-api.librato.com/v1/spaces/:id
```

>Delete the space with ID 145.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/spaces/145'
```

>Response Code

```
204 No Content
```

>Response Body

```
** NOT APPLICABLE **
```

Delete the space identified by :id.

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
