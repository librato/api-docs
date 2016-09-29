# Services

Services define the actions that are taken when an alert is triggered. Example actions might include: sending an email, notifying a real-time chat room, or hitting an external web hook with a POST.

A single service can be shared across multiple alerts. This allows for a single service to be configured and reused on multiple alerts without having to copy the service details. Similarly, a single alert can notify multiple services of the same type. For example, a single alert could notify multiple real-time chat rooms.

Each service is chosen from a set of supported back end services. The supported services are implemented in the [Librato Services](https://www.librato.com/docs/kb/alert/alerts-intro.html#notification-services) Github repository. Users are encouraged to contribute new services.

#### Service Properties

Property | Definition
-------- | ----------
id | Each service has a unique numeric ID.
type | The service type (e.g. Campfire, Pagerduty, mail, etc.). See an extensive list of [services here](https://www.librato.com/docs/kb/alert/alerts-intro.html#notification-services).
settings | Hash of settings specific to the service type.
title | Display title for the service.

#### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination5). Specific to services, the default value of the `orderby` pagination parameter is `title`, and the permissible values of the `orderby` pagination parameter are: `title` and `updated_at`.


## Create a Service

>Create a service that notifies the campfire room Ops:

```shell
curl \
  -u <user>:<token> \
  -d 'title=Notify Ops Room&type=campfire&settings%5Btoken%5D=1234567890ABCDEF&settings%5Broom%5D=Ops&settings%5Bsubdomain%5D=acme' \
  -X POST \
  'https://metrics-api.librato.com/v1/services'
```

```ruby
Not available
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
Location: /v1/services/145
```

>Response Body

```json
{
  "id": "145",
  "type": "campfire",
  "settings": {
    "room": "Ops",
    "token": "1234567890ABCDEF",
    "subdomain": "acme"
  },
  "title": "Notify Ops Room"
}
```

Creates a notification service for alerts to notify by when triggered. View the [support documentation](https://www.librato.com/docs/kb/alert/alerts-intro.html#notification-services) for a full list of supported services. Once created you will need to [associate a service with an alert](#notification-services) in order for an alert to trigger it.

#### HTTP Request

`POST https://metrics-api.librato.com/v1/services`

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### Parameters

Parameter | Definition
--------- | ----------
title | Display title for the service.
type | The service type (e.g. Campfire, Pagerduty, mail, etc.). See an extensive list of [services here](https://github.com/librato/librato-services/tree/master/services).
settings | Hash of settings specific to the service type.

## Retrieve a Service

>Return the service `156`:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/services/156'
```

```ruby
Not available
```

```python
Not available
```

>Response Code

```
200 OK
```

>Response Body

```json
{
  "id": "156",
  "type": "mail",
  "settings": {
    "addresses": "george@example.com,fred@example.com"
  },
  "title": "Email ops team"
}
```

Returns the specific service associated to the provided service `id`.

#### HTTP Request

`GET https://metrics-api.librato.com/v1/services/:id`


## Update a Service

>Update the title for service `145`:

```shell
curl \
  -u <user>:<token> \
  -d 'title=Notify Ops Chatroom' \
  -X PUT \
  'https://metrics-api.librato.com/v1/services/145'
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

Updates a service by specifying the service `id`.

#### HTTP Request

`PUT https://metrics-api.librato.com/v1/services/:id`

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

Parameter | Definition
--------- | ----------
title | Display title for the service.
type | The service type (e.g. Campfire, Pagerduty, mail, etc.). See an extensive list of [services here](https://github.com/librato/librato-services/tree/master/services).
settings | Hash of settings specific to the service type.

## Delete a Service

>Delete the service `145`:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/services/145'
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

Delete the service referenced by `:id`. It will automatically be removed from any alert that is currently using it.

#### HTTP Request

`DELETE https://metrics-api.librato.com/v1/services/:id`

## List all Services

>Return all services:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/services'
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
services = api.list_services()
for s in services:
  print(s._id, s.title, s.settings)
```

>Response Code

```
200 OK
```

>Response Body

>All services (when there are two total):

```json
{
  "query": {
    "found": 2,
    "length": 2,
    "offset": 0,
    "total": 2
  },
  "services": [
    {
      "id": "145",
      "type": "campfire",
      "settings": {
        "room": "Ops",
        "token": "1234567890ABCDEF",
        "subdomain": "acme"
      },
      "title": "Notify Ops Room"
    },
    {
      "id": "156",
      "type": "mail",
      "settings": {
        "addresses": "george@example.com,fred@example.com"
      },
      "title": "Email ops team"
    }
  ]
}
```

Returns a list of outbound services that are created within the user's account.

#### HTTP Request

`GET https://metrics-api.librato.com/v1/services`
