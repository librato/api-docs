# Instruments

## Overview

Instruments are the data representations of graphs of one or more metrics that you use to visualize and correlate behavior. Instruments can be placed on dashboards for viewing.

### Instrument Properties

Property | Definition
-------- | ----------
id | Each instrument has a unique numeric ID.
name | Title of the instrument when it is displayed.
streams | An array of hashes describing the metrics and sources to use for data in the instrument.
attributes | The attributes hash configures specific components of an instruments's visualization.

### Stream Properties

Instrument streams have the following properties. Many of the stream properties are the same attributes that can be set on individual metrics and they will override the specific metric attributes. See the [metric attributes documentation](#metric-attributes) for more info on what the attributes mean.

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

### Attribute Properties

Property | Definition
-------- | ----------
display_stacked | Boolean indicating whether to render the instrument as a stacked area chart.
display_integral | Boolean indicating whether do display the integral of each series as an explicit number.

## Retrieve Instruments

>Definition

```
GET https://metrics-api.librato.com/v1/instruments
```

>Example Request: Return all instruments owned by the user

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/instruments'
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
  "query": {
    "found": 1,
    "length": 1,
    "offset": 0,
    "total": 15
  },
  "instruments": [
    null
  ]
}
```

Returns instruments created by the user.

### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination). Specific to instruments, the default value of the `orderby` pagination parameter is `updated_at`, and the permissible values of the `orderby` pagination parameter are: `updated_at`.

## Retrieve Instrument Details

>Definition

```
GET https://metrics-api.librato.com/v1/instruments/:id
```

>Example Request: Return instrument ID 123

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/instruments/123'
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
{
  "id": 123,
  "name": "Server Temperature",
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
  ],
  "attributes": {
    "display_integral": true
  }
}
```

Returns the details of a specific instrument.

## Create an Instrument

>Definition

```
POST https://metrics-api.librato.com/v1/instruments
```

>Example Request: Create an instrument named `Server Temperature` which will display the internal server temperature (metric=`server_temp`) for application server 1 (source=`app1`) in the same graph as the average external temperature in the datacenter for all sources (source=`*`) and a 'dynamic source' to be specified by the user after the graph has loaded, or on the URL. (source=`%`). The literal `%` needs to be % encoded for it to be handled properly, hence `%25`.

```shell
curl \
  -u <user>:<token> \
  -d 'name=Server Temperature' \
  -d 'streams[0][metric]=server_temp' \
  -d 'streams[0][source]=app1' \
  -d 'streams[1][metric]=environmental_temp' \
  -d 'streams[1][source]=*' \
  -d 'streams[1][group_function]=average' \
  -d 'streams[2][metric]=server_temp' \
  -d 'streams[2][source]=%25' \
  -d 'attributes[display_integral]=true' \
  -X POST \
  https://metrics-api.librato.com/v1/instruments
```

>POST Request Body (JSON)

```json
{
  "name": "Server Temperature",
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
  ],
  "attributes": {
    "display_integral": true
  }
}
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/instruments/123
```

>Response Body

```json
{
  "id": 123,
  "name": "Server Temperature",
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
  ],
  "attributes": {
    "display_integral": true
  }
}
```

>POST Request Body - Composite Streams (JSON)

```json
{
  "name": "Server Temperature",
  "streams": [
    {
      "composite": "s(\"server_t*\", \"app*\")",
      "display_min": 0
    },
    {
      "composite": "s(\"*temp*\", \"%\", {function: \"mean\", period: \"3600\"})"
    }
  ]
}
```

#### headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### parameters

Parameter | Definition
--------- | ----------
name | Title of the instrument when it is displayed.
streams | An array of hashes describing the metrics and sources to use for data in the instrument.
attributes | The attributes hash configures specific components of an instruments's visualization.

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

### Attribute Properties

Property | Definition
-------- | ----------
display_stacked | Boolean indicating whether to render the instrument as a stacked area chart.
display_integral | Boolean indicating whether do display the integral of each series as an explicit number.

## Update an Instrument

>Definition

```
PUT https://metrics-api.librato.com/v1/instruments/:id
```

>Example Request: Add a new data stream (metric server_temp from source app3) to an instrument which currently displays server temp for app1 and the average environmental temperature. Instrument streams are always overwritten, so to add a stream you must the entire new list of streams.

```shell
curl \
  -u <user>:<token> \
  -d 'streams[0][metric]=server_temp' \
  -d 'streams[0][source]=app1' \
  -d 'streams[1][metric]=server_temp' \
  -d 'streams[1][source]=app3' \
  -d 'streams[2][metric]=environmental_temp' \
  -d 'streams[2][source]=*' \
  -d 'streams[2][group_function]=average' \
  -d 'attributes[display_integral]=true' \
  -X PUT \
  https://metrics-api.librato.com/v1/instruments/129
```

>PUT Request Body (JSON)

```json
{
  "name": "Server Temperature",
  "streams": [
    {
      "metric": "server_temp",
      "source": "app1"
    },
    {
      "metric": "server_temp",
      "source": "app3"
    },
    {
      "metric": "environmental_temp",
      "source": "*",
      "group_function": "average"
    }
  ],
  "attributes": {
    "display_integral": true
  }
}
```

>PUT Request Body - Composite Streams (JSON)

```json
{
  "name": "Server Temperature",
  "streams": [
    {
      "composite": "s(\"server_t*\", \"app*\")",
      "display_min": 0
    },
    {
      "composite": "s(\"*temp*\", \"%\", {function: \"mean\", period: \"3600\"})"
    }
  ]
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

#### headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### parameters

Parameter | Definition
--------- | ----------
name | Title of the instrument when it is displayed.
streams | An array of hashes describing the metrics and sources to use for data in the instrument.
attributes | The attributes hash configures specific components of an instruments's visualization.

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

## Delete an Instrument

>Definition

```
DELETE https://metrics-api.librato.com/v1/instruments/:id
```

>Example Request: Delete the instrument ID 123

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/instruments/123'
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