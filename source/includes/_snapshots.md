# Snapshots

Snapshots provide the ability to capture a point-in-time image of a given chart as a PNG file to share with collaborators via email and/or chat applications such as Slack, Campfire, HipChat, and Flowdock.

#### Snapshot Properties

Property | Definition
-------- | ----------
href | A link to the representation of the snapshot.
job_href | A link to the representation of the [background job](#jobs) created to process the snapshot.
image_href | A link to the PNG file of the snapshot. Initially `null` until background job has processed rendering.
duration | Time interval of the snapshot, in seconds.
end_time | Time indicating the end of the interval.
created_at | Time the snapshot was created.
updated_at | Time the snapshot was updated.
subject | The subject [chart](#retrieve-a-chart) of the snapshot.

## Create a Snapshot

>Create a snapshot of a stacked chart with the `id` of 1, and streams matching the tag set `environment:prod*`:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d '{
    "subject": {
      "chart": {
        "id": 1,
        "tags": [{"name": "environment", "values": ["prod*"]}],
        "type": "stacked"
      }
    }
  }
  ' \
  -X POST \
  'https://metrics-api.librato.com/v1/snapshots'
```

```ruby
Not available
```

>Response Code

```
202 Accepted
```

>Response Headers

```
Location: /v1/snapshots/:id
```

>Response Body

```json
{
  "href": "https://metrics-api.librato.com/v1/snapshots/1",
  "job_href": "https://metrics-api.librato.com/v1/jobs/123456",
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

Create a new snapshot by providing the subject parameters (associated with the chart). The parameters of the `chart` array include `id` and chart `type`.

#### HTTP Request

`POST https://metrics-api.librato.com/v1/snapshots`

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### Parameters

Parameter | Definition
--------- | ----------
subject | The subject [chart](#retrieve-a-chart) of the snapshot, e.g., `{"chart":{"id": 1, "source": "*", "type": "stacked"}}`.
duration<br>`optional` | Time interval over which to take the snapshot, in seconds. Defaults to 3600 (1 hour).
end_time<br>`optional` | Time indicating the end of the interval. Defaults to present.

#### Subject Parameters

Parameter | Definition
--------- | ----------
id | Each chart has a unique numeric ID.
type | Indicates the type of chart. One of `line`, `stacked` or `bignumber`.
tags | A set of key/value pairs that describe the particular data stream. Tags behave as extra dimensions that data streams can be filtered and aggregated along. The full set of unique tag pairs defines a single data stream. Wildcards can be used here (e.g. prod-* will include all tags that begin with prod-).

## Retrieve a Snapshot

>Return the snapshot with the `id` 1.

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/snapshots/1'
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
  "href": "https://metrics-api.librato.com/v1/snapshots/1",
  "job_href": "https://metrics-api.librato.com/v1/jobs/123456",
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

Returns a specific snapshot associated with an `id`.

#### HTTP Request

`GET https://metrics-api.librato.com/v1/snapshots/:id`
