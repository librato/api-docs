# Chart Tokens

Chart tokens allow you to make graphs for selected resources viewable to the public. Accessing a graph resource via a chart token does not require [authentication](#authentication). You may create chart tokens for [Instruments](#instruments) and Dashboards.

<aside class="notice">Note: Chart tokens do not apply to Spaces.</aside>

#### Chart Token Properties

All tokens have the following three properties:

Property | Definition
-------- | ----------
token | The randomly generated string which is used to identify the chart token.
entity_type | The type of resource the chart token refers to. This may be either instrument or dashboard.
entity_id | The ID of the entity that the chart token refers to. This would either be the instrument's or dashboard's ID.

## Retrieve a Chart Token

>Return the chart token associated with the `token` irhjoz9f:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/charts/irhjoz9f'
```

```ruby
Not available
```

>Response Code

```
200 OK
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

#### HTTP Request

`GET https://metrics-api.librato.com/v1/charts/:token`

## Create a Chart Token

>Create a chart token for the instrument with `id` 1848:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'entity_type=instrument&entity_id=1848' \
  -X POST \
  'https://metrics-api.librato.com/v1/charts'
```

```ruby
Not available
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

#### HTTP Request

`POST https://metrics-api.librato.com/v1/charts`

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### Parameters

Parameter | Definition
--------- | ----------
entity_type | The type of resource the chart token refers to. This may be either instrument or dashboard.
entity_id | The ID of the entity that the chart token refers to. This would either be the instrument's or dashboard's ID.

## Delete Chart Token

#### HTTP Request

`
DELETE https://metrics-api.librato.com/v1/charts/:token
```

>Delete the chart token `conrhpsk`.

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X DELETE \
  'https://metrics-api.librato.com/v1/charts/conrhpsk'
```

```ruby
Not available
```

>Response Code

```
204 No Content
```

Delete the specified chart token, revoking public access to the referenced entity. This will only delete access to the referenced entity via this chart token; it does affect the referenced entity.

## List all Chart Tokens

>List all chart tokens:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/charts'
```

```ruby
Not available
```

>Response Code

```
200 OK
```

>Response Body (when there are 3 chart tokens):

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

#### HTTP Request

`GET https://metrics-api.librato.com/v1/charts`

### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination5). Specific to chart tokens, the default and only permissible value of the `orderby` pagination parameter is `token`.

Parameter | Definition
--------- | ----------
token | A search parameter that limits the results to counters whose names contain a matching substring. The search is not case-sensitive.
