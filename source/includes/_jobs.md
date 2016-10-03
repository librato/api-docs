# Jobs

Some resources in the Librato API allow you to make requests which will take longer to complete than is reasonable for a single request-response cycle. These resources will respond with a job which you can use to follow progress and final state of the request.

Requests which start jobs will respond with an HTTP status code of `202 Accepted`. They will also include the URI to query for job status as a `Location:` response header.

#### Job Properties

Jobs can be queried for their current state and other status information. They have the following properties:

Property | Definition
-------- | ----------
id | Each job has a unique numeric ID.
state | Reflects the current status of the job, will be one of `queued`, `working`, `complete` `failed`, or `canceled`.
progress<br>`optional` | a floating point number from `0.0-100.0` reflecting how close to completion the job is currently.
output<br>`optional` | if the job results in output it will be available in this field.
errors<br>`optional` | if the job results in any errors they will be available in this field.

## Retrieve a Job

>Check status for job qith the `id` 123456:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/jobs/123456'
```

```ruby
Not available
```

>Response properties may vary depending on the state of the job. Some jobs may only report `id` and `state`, so you are encouraged to consider `state` authoritative rather than relying on the presence of other properties (`errors` or `progress` for example).

>Job in progress:

```json
{
  "id": 123456,
  "state": "working",
  "progress": 31.56
}
```

>Job which has completed successfully:

```json
{
  "id": 123456,
  "state": "complete",
  "progress": 100.0
}
```

>A queued job which has not started yet:

```json
{
  "id": 123456,
  "state": "queued"
}
```

>A job that has failed:

```json
{
  "id": 123456,
  "state": "failed",
  "errors": {
    "name": [
      "is invalid"
    ]
  }
}
```

Returns information for a specific job. All jobs will return their `id` and `state`. Some jobs may also return one or more [optional properties](#jobs).

#### HTTP Request

`GET https://metrics-api.librato.com/v1/jobs/:id`

#### About Jobs

Jobs are spawned by other resources in the Librato API when an operation will take longer to complete than is allowed by a single request-response cycle.
