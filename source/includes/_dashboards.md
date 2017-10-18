# Dashboards

## Overview

<aside class="notice">Note: This is a legacy feature & deprecated. Please refer to the <a href="#spaces">Spaces section</a> for displaying a collection of charts.</aside>

Dashboards contain a stacked collection of instruments that graph one or more metrics in real time. Dashboards can be projected on large-screen displays to easily observe many metrics side-by-side.

### Dashboard Properties

Property | Definition
-------- | ----------
id | Each dashboard has a unique numeric ID
name | Unique name for dashboard
instruments | Array of objects containing the IDs of the instruments to be included, in order

## Retrieve All Dashboards

>Definition

```
GET https://metrics-api.librato.com/v1/dashboards
```

>Example Request

>Return all dashboards owned by the user with name matching ops:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/dashboards?name=ops'
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
  "query": {
    "found": 1,
    "length": 1,
    "offset": 0,
    "total": 15
  },
  "dashboards": [
    {
      "id": 4,
      "name": "staging_ops"
    }
  ]
}
```

Returns all dashboards created by the user.

### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination). Specific to dashboards, the default value of the `orderby` pagination parameter is `name`, and the permissible values of the `orderby` pagination parameter is `name`.

Parameter | Definition
--------- | ----------
name | Search by name of the dashboard.

## Retrieve Specific Dashboard

>Definition

```
GET https://metrics-api.librato.com/v1/dashboards/:id
```

>Example Request

>Return the dashboard id `129`.

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/dashboards/129'
```

>Response Code

```
200 OK
```

>Response Body

```json
{
  "name": "CPUs",
  "id": 129,
  "instruments": [
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

Returns the details of a specific dashboard.

## Create a Dashboard

>Definition

```
POST https://metrics-api.librato.com/v1/dashboards
```

>Example Request

>Create a dashboard with name CPUs containing the instruments identified by IDs 4, 87, and 9, in that order:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'name=CPUs&instruments%5B%5D=4&instruments%5B%5D=87&instruments%5B%5D=9' \
  -X POST \
  'https://metrics-api.librato.com/v1/dashboards'
```

```ruby
Not available
```

>Using JSON

```json
{
  "name": "CPUs",
  "instruments": [
    {
      "id": 4
    },
    {
      "id": 87
    },
    {
      "id": 9
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
Location: /v1/dashboards/129
```

>Response Body

```json
{
  "name": "CPUs",
  "id": 129,
  "instruments": [
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

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

## Modify a Dashboard

>Definition

```
PUT https://metrics-api.librato.com/v1/dashboards/:id
```

>Example Request

>If we have a dashboard with instruments [42, 7, 16], and we want to swap 42 and 7, remove 16, and add 99. Submit the instruments field with the new IDs, in the order you want them to appear.

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'name=CPUs&instruments%5B%5D=7&instruments%5B%5D=42&instruments%5B%5D=99' \
  -X PUT \
  'https://metrics-api.librato.com/v1/dashboards/:id'
```

```ruby
Not available
```

>Using JSON

```json
{
  "name": "CPUs",
  "instruments": [
    {
      "id": 7
    },
    {
      "id": 42
    },
    {
      "id": 99
    }
  ]
}
```

>Response Code

```
204 No Content
```

Modify a dashboard, such as changing the name, or adding, deleting or reordering instruments.

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

## Delete Dashboard

>Definition

```
DELETE https://metrics-api.librato.com/v1/dashboards/:id
```

>Example Request

>Delete the dashboard with ID `145`:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X DELETE \
  'https://metrics-api.librato.com/v1/dashboards/145'
```

```ruby
Not available
```

>Response Code

```
204 No Content
```

Delete the dashboard identified by :id.
