# Annotations
## Overview

Annotations are used to record external events (e.g. a deployment) that typically occur at non-uniform times, yet may impact the behavior of monitored metrics. Each annotation event has an associated time and metadata description. When a set of annotation events are added to a graph, each event is plotted as a single vertical line. This permits a user to correlate operational or business actions to observed metrics.

Every annotation event is associated with a single named annotation stream, analogous to how multiple measurements are associated with the named metric they belong to. For example, you might have an annotation stream named ux-app-deploys to track deployments to your UX application and another annotation stream api-app-deploys to track deploys to your API application. Multiple annotation events can be added to a graph by selecting the name of the annotation stream, similar to selecting a metric name.

An annotation event can also include an end time to represent an event that spanned a duration of time. For example, a batch job that ran for five minutes would set the annotation event's start time when the job started and update the annotation event with an end time when the job completed. Annotation events that include an end time will be displayed with their start and end times as connected vertical lines on graphs.

### Annotation Streams

Annotation streams group related annotation events into a single timeline. Annotation streams are referenced by their name and are automatically created when an annotation event is POSTed to a new annotation stream name.

Annotation streams have the following properties:

Annotation Property | Definition
------------------- | ----------
name | Name of the annotation stream.
display_name | The string used to display this annotation stream.

### Annotation Events

An annotation event records a single point in time when an external action (like a deployment) occurred. Annotation events can include metadata that describe the particular event in more detail or reference an external site.

Annotation events have the following properties:

Annotation Property | Definition
------------------- | ----------
id | Each annotation event has a unique numeric ID.
title | The title of an annotation is a string and may contain spaces. The title should be a short, high-level summary of the annotation e.g. `v45 Deployment`. The title is a required parameter to create an annotation.
source | A string which describes the originating source of an annotation when that annotation is tracked across multiple members of a population. Examples: foo3.bar.com, user-123, 77025.
description | The description contains extra metadata about a particular annotation. The description should contain specifics on the individual annotation e.g. `Deployed 9b562b2: shipped new feature foo!` A description is not required to create an annotation.
links | An optional list of references to resources associated with the particular annotation. For example, these links could point to a build page in a CI system or a changeset description of an SCM. Each link has a tag that defines the link's relationship to the annotation. See the [link documentation](#add-link-to-annotation-event) for details on available parameters.
start_time | The [unix timestamp](http://en.wikipedia.org/wiki/Unix_time) indicating the the time at which the event referenced by this annotation started. By default this is set to the current time if not specified.
end_time | The [unix timestamp](http://en.wikipedia.org/wiki/Unix_time) indicating the the time at which the event referenced by this annotation ended. For events that have a duration, this is a useful way to annotate the duration of the event. This parameter is optional and defaults to null if not set.

## Retrieve Annotations

>Definition

```
GET https://metrics-api.librato.com/v1/annotations
```

>Example Request

>All annotation streams:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/annotations'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics::Annotator.new.list
```

```python
import librato
api = librato.connect(<user>, <token>)
for stream in api.list_annotation_streams():
  print(stream.name)
```

>All annotation streams matching the name `api`:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/annotations?name=api'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics::Annotator.new.list name: ('api')
```

```python
import librato
api = librato.connect(<user>, <token>)
for stream in api.list_annotation_streams(name="api"):
  print(stream.name)
 ```

>Response Code

```
200 OK
```

>Response Headers

```
** NOT APPLICABLE **
```

>Response Body (all annotation streams)

```json
{
  "query": {
    "found": 2,
    "length": 2,
    "offset": 0,
    "total": 2
  },
  "annotations": [
    {
      "name": "api-deploys",
      "display_name": "Deploys to API"
    },
    {
      "name": "app-deploys",
      "display_name": "Deploys to UX app"
    }
  ]
}
```

Return a list of annotation streams.

### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination). Specific to annotation streams, the default value of the `orderby` pagination parameter is `name`, and the permissible values of the `orderby` pagination parameter are: `name`.

## Retrieve Annotations by Name

>Definition

```
GET https://metrics-api.librato.com/v1/annotations/:name
```

>Example Request

>Return details of the annotation stream name api-deploys.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/annotations/api-deploys'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics::Annotator.new.list name: ('api-deploys')
```

```python
import librato
api = librato.connect(<user>, <token>)
stream = api.get_annotation_stream("api-deploys", start_time="1234500000")
for source in stream.events:
   print source
   events = stream.events[source]
   for event in events:
       print event['id']
       print event['title']
       print event['description']
```

>Specifying a set of [time interval search parameters](#time-intervals) will return a list of all annotation events for a stream. For example, to return the set of annotation events on the annotation stream blog-posts between two timestamps and limited to sources `db1.acme` and `db2.acme`:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/annotations/blog-posts?start_time=1234500000&end_time=1234600000&sources%5B%5D=db1.acme&sources%5B%5D=db2.acme'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics::Annotator.new.fetch :'blog-posts', start_time: 1234500000, end_time: 1234600000, sources: ['db1.acme', 'db2.acme']
```

```python
import librato
api = librato.connect(<user>, <token>)
stream = api.get_annotation_stream("blog-posts", 
  start_time="1234500000", 
  end_time="1234600000", 
  sources=['db1.acme', 'db2.acme'])
print(stream.events)
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

>An annotation stream from multiple sources:

```json
{
  "name": "api-deploys",
  "display_name": "Deploys to API",
  "events": [
    {
      "unassigned": [
        {
          "id": 45,
          "title": "Deployed v91",
          "description": null,
          "start_time": 1234567890,
          "end_time": null,
          "source": null,
          "links": [
            {
              "label": "Github commit",
              "rel": "github",
              "href": "http://github.com/org/app/commit/01beaf"
            },
            {
              "label": "Jenkins CI build job",
              "rel": "jenkins",
              "href": "http://ci.acme.com/job/api/34"
            }
          ]
        }
      ],
      "foo3.bar.com": [
        {
          "id": 123,
          "title": "My Annotation",
          "description": null,
          "start_time": 1234567890,
          "end_time": null,
          "source": "foo3.bar.com",
          "links": [

          ]
        },
        {
          "id": 1098,
          "title": "Chef run finished",
          "description": "Chef migrated up to SHA 44a87f9",
          "start_time": 1234567908,
          "end_time": 1234567958,
          "source": "foo3.bar.com",
          "links": [

          ]
        }
      ]
    }
  ]
}
```

Return a list of annotations associated with given stream name.

### Annotation Search Parameters

If optional [time interval search parameters](#time-intervals) are specified, the response includes the set of annotation events with start times that are covered by the time interval. Annotation events are always returned in order by their start times.

Annotation events are grouped by their originating source name if one was specified when the annotation event was created. All annotation events that were created without an explicit source name are listed with the source name `unassigned`.

Annotation events can be further restricted by the following search parameters:

Search Parameter | Definition
---------------- | ----------
sources | An array of source names to limit the search to. Can include source name wildcards like `db-*` to show annotations from all db sources.

## Retrieve Annotation Event

>Definition

```
GET https://metrics-api.librato.com/v1/annotations/:name/:id
```

>Example Request

>Lookup the annotation event 189 in the annotation stream `api-deploys`:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/annotations/api-deploys/189'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics::Annotator.new.fetch :'api-deploys', start_time: (Time.now.to_i-3600)
```

```python
Not available
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
  "id": 189,
  "title": "Deployed v91",
  "description": null,
  "start_time": 1234567890,
  "end_time": null,
  "source": null,
  "links": [
    {
      "label": "Github commit",
      "rel": "github",
      "href": "http://github.com/org/app/commit/01beaf"
    },
    {
      "label": "Jenkins CI build job",
      "rel": "jenkins",
      "href": "http://ci.acme.com/job/api/34"
    }
  ]
}
```

Return annotation event details associated with given stream name.

## Create Annotations

>Definition

```
POST https://metrics-api.librato.com/v1/annotations/:name
```

>Example Request

>Create an annotation event in the app-deploys stream

```shell
curl \
  -u <user>:<token> \
  -d 'title=Deployed v56&source=foo3.bar.com&description=v56 - Fixed typo in page titles' \
  -X POST \
  'https://metrics-api.librato.com/v1/annotations/app-deploys'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.annotate :'app-deploys', 'Deployed v56', source: 'foo3.bar.com',
    description: 'v56 - Fixed typo in page titles'
```

```python
import librato
api = librato.connect(<user>, <token>)
api.post_annotation("app-deploys", 
  title="Deployed v56", 
  source="foo3.bar.com", 
  description="v56 - Fixed typo in page titles")
```

>Create an annotation event at a specific timestamp:

```shell
curl \
  -u <user>:<token> \
  -d 'title=My Annotation&description=Joe deployed v29 to metrics&start_time=1234567890' \
  -X POST \
  'https://metrics-api.librato.com/v1/annotations/api-deploys'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.annotate :'app-deploys', 'My Annotation', source: 'foo3.bar.com',
    start_time: 1234567890, description: 'Joe deployed v29 to metrics'
```

```python
import librato
api = librato.connect(<user>, <token>)
api.post_annotation("app-deploys", 
  title="My Annotation", 
  source="foo3.bar.com", 
  start_time="1234567890", 
  description="Joe deployed v29 to metrics")
```

>Create an annotation event with a link:

```shell
curl \
  -u <user>:<token> \
  -d 'title=My Annotation&description=Joe deployed v29 to metrics&start_time=1234567890' \
  -d 'links[0][label]=Metrics Gem' \
  -d 'links[0][href]=https://github.com/librato/librato-metrics' \
  -d 'links[0][rel]=github' \
  -X POST \
  'https://metrics-api.librato.com/v1/annotations/api-deploys'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.annotate :'app-deploys', 'My Annotation', source: 'foo3.bar.com',
    start_time: 1234567890, description: 'Joe deployed v29 to metrics',
    links: [label: 'Metrics Gem', href: 'https://github.com/librato/librato-metrics', rel: 'github']
```

```python
import librato
api = librato.connect(<user>, <token>)
api.post_annotation("app-deploys", 
  title="My Annotation", 
  source="foo3.bar.com", 
  start_time="1234567890", 
  description="Joe deployed v29 to metrics", 
  links=[{'rel': 'github', 'href': 'https://github.com/librato/librato-metrics'}])
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/annotations/api-deploys/123
```

>Response Body

```json
{
  "id": 123,
  "title": "My Annotation",
  "description": "Joe deployed v29 to metrics",
  "source": null,
  "start_time": 1234567890,
  "end_time": null,
  "links": [

  ]
}
```

Create an annotation event on the given annotation stream `:name`. If the annotation stream does not exist, it will be created automatically.

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

Parameter | Definition
--------- | ----------
title | The title of an annotation is a string and may contain spaces. The title should be a short, high-level summary of the annotation e.g. `v45 Deployment`. The title is a required parameter to create an annotation.
source<br>`optional` | A string which describes the originating source of an annotation when that annotation is tracked across multiple members of a population. Examples: foo3.bar.com, user-123, 77025.
description<br>`optional` | The description contains extra metadata about a particular annotation. The description should contain specifics on the individual annotation e.g. `Deployed 9b562b2: shipped new feature foo!` A description is not required to create an annotation.
links<br>`optional` | An optional list of references to resources associated with the particular annotation. For example, these links could point to a build page in a CI system or a changeset description of an SCM. Each link has a tag that defines the link's relationship to the annotation. See the [link documentation](#add-link-to-annotation-event) for details on available parameters.
start_time<br>`optional` | The [unix timestamp](http://en.wikipedia.org/wiki/Unix_time) indicating the the time at which the event referenced by this annotation started. By default this is set to the current time if not specified.
end_time<br>`optional` | The [unix timestamp](http://en.wikipedia.org/wiki/Unix_time) indicating the the time at which the event referenced by this annotation ended. For events that have a duration, this is a useful way to annotate the duration of the event. This parameter is optional and defaults to null if not set.

## Add Link to Annotation Event

>Definition

```
POST https://metrics-api.librato.com/v1/annotations/:name/:id/links
```

>Example Request

>Add a link to github to the annotation event 198 in the *app-deploys* stream:

```shell
curl \
  -u <user>:<token> \
  -d 'rel=github&label=Github Commit&href=https://github.com/acme/app/commits/01beaf' \
  -X POST \
  'https://metrics-api.librato.com/v1/annotations/app-deploys/198/links'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics::Annotator.new.fetch :'app-deploys', start_time: (Time.now.to_i-3600), end_time: (Time.now.to_i), sources: ['db1.acme', 'db2.acme']
```

```python
Not available
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/annotations/app-deploys/198/links/github
```

>Response Body

```
{
  "rel": "github",
  "label": "Github Commit",
  "href": "https://github.com/acme/app/commits/01beaf"
}
```

Add a link to a specific annotation event.

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Parameters

Parameter | Definition
--------- | ----------
rel | Defines the relationship of the link. A link's relationship must be unique within a single annotation event.
href | The link URL.
label<br>`optional` | A display label for the link.

## Update Attributes

>Definition

```
PUT https://metrics-api.librato.com/v1/annotations/:name
```

>Example Request

>Update the display name of the annotation stream api-deploys:

```shell
curl \
  -u <user>:<token> \
  -d 'display_name=Deploys to API' \
  -X PUT \
  'https://metrics-api.librato.com/v1/annotations/api-deploys'
```

```ruby
Not available
```

```python
Not available
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

Update the attributes of an annotation stream.

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Parameters

Parameter | Definition
--------- | ----------
display_name | Name used to display the annotation stream.

## Update Meta-Data

>Definition

```
PUT https://metrics-api.librato.com/v1/annotations/:name/:id
```

>Example Request

>Update the description of the annotation 143 in the stream `app-deploys`:

```shell
curl \
  -u <user>:<token> \
  -d 'description=Deployed git SHA 601060a68ff2e' \
  -X PUT \
  'https://metrics-api.librato.com/v1/annotations/app-deploys/143'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics::Annotator.new.update_event :app-deploys, 143, description: 'Deployed git SHA 601060a68ff2e'
```

```python
Not available
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

Update the metadata of an annotation event.

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Parameters

The following parameters can be updated:

Parameter | Definition
--------- | ----------
title | Short description of annotation event.
description | Long description of annotation event.
end_time | Sets an end time for annotation events that occurred over a duration.
links | An optional list of references to resources associated with the particular annotation. For example, these links could point to a build page in a CI system or a changeset description of an SCM. Each link has a tag that defines the link\'s relationship to the annotation.

## Delete Annotation Stream

>Definition

```
DELETE https://metrics-api.librato.com/v1/annotations/:name
```

>Example Request

>Delete the annotation stream api-deploys

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/annotations/api-deploys'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics::Annotator.new.delete :api-deploys
```

```python
import librato
api = librato.connect(<user>, <token>)
api.delete_annotation_stream("api-deploys")
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

Delete an annotation stream. This will delete all annotation events associated with the stream.

## Delete Annotation Event

>Definition

```
DELETE https://metrics-api.librato.com/v1/annotations/:name/:id
```

>Example Request

>Delete the annotation event 123 in the annotation stream app-deploys:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/annotations/app-deploys/123'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics::Annotator.new.delete_event :api-deploys, 123
```

```python
Not available
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

Delete an annotation event.

## Delete Link From Annotation Event

>Definition

```
DELETE https://metrics-api.librato.com/v1/annotations/:name/:id/links/:link
```

>Example Request

>Delete the link with the relationship github from the annotation event 189 in the annotation stream app-deploys:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/annotations/app-deploys/189/links/github'
```

```ruby
Not available
```

```python
Not available
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

Delete a link from an annotation event.
