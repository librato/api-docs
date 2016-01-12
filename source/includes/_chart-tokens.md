# Chart Tokens

## Overview

Chart tokens allow you to make graphs for selected resources viewable to the public. Accessing a graph resource via a chart token does not require [authentication](#authentication). You may create chart tokens for [Instruments](#instruments) and Dashboards.

<aside class="notice">Note: Chart tokens do not apply to Spaces.</aside>

### Chart Token Properties

All tokens have the following three properties:

Property | Definition
-------- | ----------
token | The randomly generated string which is used to identify the chart token.
entity_type | The type of resource the chart token refers to. This may be either instrument or dashboard.
entity_id | The ID of the entity that the chart token refers to. This would either be the intrument's or dashboard's ID.

## Retrieve Chart Tokens

>Definition

```
GET https://metrics-api.librato.com/v1/charts
```

>Example Request: Retrieve all chart tokens

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/charts'
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
<br><br>
>All chart tokens (when there are 3 total):

```json
{
  "query": {
    "found": 3,
    "length": 3,
    "offset": 0,
    "total": 3
  },
  "charts": [
    {
      "token": "conrhpsk",
      "entity_id": 34,
      "entity_type": "instrument"
    },
    {
      "token": "jdqs9ki9",
      "entity_id": 89,
      "entity_type": "dashboard"
    },
    {
      "token": "1psp35gj",
      "entity_id": 23,
      "entity_type": "instrument"
    }
  ]
}
```

Returns a listing of available chart tokens.

### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination). Specific to chart tokens, the default and only permissible value of the `orderby` pagination parameter is `token`.

Parameter | Definition
--------- | ----------
token | A search parameter that limits the results to counters whose names contain a matching substring. The search is not case-sensitive.

## Retrieve Specific Chart Token

>Definition

```
GET https://metrics-api.librato.com/v1/charts/:token
```

>Example Request: Return the chart token with token irhjoz9f

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/charts/irhjoz9f'
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
  "token": "irhjoz9f",
  "entity_id": 1848,
  "entity_type": "instrument"
}
```

Returns a specific chart token.

## Create Chart Token

>Definition

```
POST https://metrics-api.librato.com/v1/charts
```

>Example Request: Create a chart token for the instrument with ID 1848

```shell
curl \
  -u <user>:<token> \
  -d 'entity_type=instrument&entity_id=1848' \
  -X POST \
  'https://metrics-api.librato.com/v1/charts'
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/charts/irhjoz9f
```

>Response Body

```json
{
  "token": "irhjoz9f",
  "entity_id": 1848,
  "entity_type": "instrument"
}
```

Creates a new chart token.

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Required Parameters

Parameter | Definition
--------- | ----------
entity_type | The type of resource the chart token refers to. This may be either instrument or dashboard.
entity_id | The ID of the entity that the chart token refers to. This would either be the intrument's or dashboard's ID.

## Delete Chart Token

>Definition

```
DELETE https://metrics-api.librato.com/v1/charts/:token
```

>Example Request

>Delete the chart token `conrhpsk`.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/charts/conrhpsk'
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

Delete the specified chart token, revoking public access to the referenced entity. This will only delete access to the referenced entity via this chart token; it does affect the referenced entity.