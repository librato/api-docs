# Snapshots

<aside class="notice">
Tag support for Snapshots is not yet available. Taking a snapshot of a chart will still retrieve the streams with a specified tag set, and if using dynamic tags will display an aggregated stream for each metric.
</aside>

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

>Create a snapshot of a stacked chart associated with the `id` of 1:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d '{
    "subject": {
    "chart": {
      "id": 1,
      "type": "stacked"
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
duration<br>`optional` | Time interval over which to take the snapshot, in seconds. Defaults to 3600 (1 hour).
end_time<br>`optional` | Time indicating the end of the interval. Defaults to present.

#### Subject Parameters

Parameter | Definition
--------- | ----------
id | Each chart has a unique numeric ID.
type | Indicates the type of chart. One of `line`, `stacked` or `bignumber`.

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
