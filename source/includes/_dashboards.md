# Dashboards

## Overview

Dashboards contain a stacked collection of instruments that graph one or more metrics in real time. Dashboards can be projected on large-screen displays to easily observe many metrics side-by-side.

### Dashboard Properties

Property | Definition
-------- | ----------
id | Each dashboard has a unique numeric ID
name | Unique name for dashboard
instruments | Array of objects containing the IDs of the instruments to be included, in order

## Retrieve Dashbboards

>Definition

```
GET https://metrics-api.librato.com/v1/dashboards
```

>Return all dashboards owned by the user with name matching ops

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/dashboards?name=ops'
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

## Create a Dashboard

>Definition

```
POST https://metrics-api.librato.com/v1/dashboards
```

>Create a dashboard with name CPUs containing the instruments identified by IDs 4, 87, and 9, in that order (using Form-Encoded params)

```shell
curl \
  -u <user>:<token> \
  -d 'name=CPUs&instruments%5B%5D=4&instruments%5B%5D=87&instruments%5B%5D=9' \
  -X POST \
  'https://metrics-api.librato.com/v1/dashboards'
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

### Headers

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

>Example: If we have a dashboard with instruments [42, 7, 16], and we want to swap 42 and 7, remove 16, and add 99.

>Submit the instruments field with the new IDs, in the order you want them to appear (using Form-Encoded params)

```shell
curl \
  -u <user>:<token> \
  -d 'name=CPUs&instruments%5B%5D=7&instruments%5B%5D=42&instruments%5B%5D=99' \
  -X PUT \
  'https://metrics-api.librato.com/v1/dashboards/:id'
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

>Response Headers

```
** NOT APPLICABLE **
```

>Response Body

```
** NOT APPLICABLE **
```

Modify a dashboard, such as changing the name, or adding, deleting or reordering instruments.

### Headers

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

>Delete the dashboard with ID 145.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/dashboards/145'
```

>Response Code

```
204 No Content
```

>Response Body

```
** NOT APPLICABLE **
```

Delete the dashboard identified by :id.
