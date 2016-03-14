# Snapshots

## Overview

Snapshots provide the ability to capture a point-in-time image of a given chart as a PNG file to share with collaborators via email and/or chat applications such as Slack, Campfire, HipChat, and Flowdock.

### Snapshot Properties

Property | Definition
-------- | ----------
href | A link to the representation of the snapshot.
job_href | A link to the representation of the [background job](#jobs) created to process the snapshot.
image_href | A link to the PNG file of the snapshot. Initially `null` until background job has processed rendering.
duration | Time interval of the snapshot, in seconds.
end_time | Time indicating the end of the interval.
created_at | Time the snapshot was created.
updated_at | Time the snapshot was updated.
subject | The subject [chart](#retrieve-chart-by-id) of the snapshot.

## Retrieve Specific Snapshot

>Definition

```
GET https://metrics-api.librato.com/v1/snapshots/:id
```

>Example Request

>Return the snapshot `1`.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/snapshots/1'
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
  "href": "https://metrics-api.librato.com/v1/snapshots/1",
  "job_href": "https://metrics-api.librato.comv1/jobs/123456",
  "image_href": "http://snapshots.librato.com/chart/tuqlgn1i-71569.png",
  "duration": 3600,
  "end_time": "2016-02-20T01:18:46Z",
  "created_at": "2016-02-20T01:18:46Z",
  "updated_at": "2016-02-20T01:18:46Z",
  "subject": {
    "chart": {
      "id": 1,
      "sources": [
        "*"
      ],
      "type": "stacked"
    }
  }
}
```

Returns a specific snapshot.

## Create a Snapshot

>Definition

```
POST https://metrics-api.librato.com/v1/snapshots
```

>Create a snapshot.

```shell
curl \
  -u <user>:<token> \
  -d 'subject[chart][id]=1&subject[chart][source]=*&subject[chart][type]=stacked' \
  -X POST \
  'https://metrics-api.librato.com/v1/snapshots'
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/snapshots/:id
```

>Response Body

```json
{
  "href": "https://metrics-api.librato.com/v1/snapshots/1",
  "job_href": "https://metrics-api.librato.comv1/jobs/123456",
  "image_href": "http://snapshots.librato.com/chart/tuqlgn1i-71569.png",
  "duration": 3600,
  "end_time": "2016-02-20T01:18:46Z",
  "created_at": "2016-02-20T01:18:46Z",
  "updated_at": "2016-02-20T01:18:46Z",
  "subject": {
    "chart": {
      "id": 1,
      "sources": [
        "*"
      ],
      "type": "stacked"
    }
  }
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
subject | The subject [chart](#retrieve-chart-by-id) of the snapshot, e.g., `{"chart":{"id": 1, "source": "*", "type": "stacked"}}`.
duration<br>`optional` | Time interval over which to take the snapshot, in seconds. Defaults to 3600 (1 hour).
end_time<br>`optional` | Time indicating the end of the interval. Defaults to present.

### Subject Properties

Property | Definition
-------- | ----------
id | Each chart has a unique numeric ID.
source | Indicates the [source](#sources) of data for the chart. Wildcard `*` to include all sources.
type | Indicates the type of chart. One of line, stacked or bignumber.
