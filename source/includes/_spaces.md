# Spaces

Spaces contain a collection of charts that graph one or more metrics in real time. The API allows you to view
details on Spaces associated with an account. The API allows you to create, modify, and delete Spaces by
referencing the `name` or `id` of the Space.

#### Space Properties

Property | Definition
-------- | ----------
id | Each space has a unique numeric ID
name | Unique name for space
tags | Boolean: Enable space for Tags.

#### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination5). Specific to spaces, the default value of the `orderby` pagination parameter is `name`, and the permissible values of the `orderby` pagination parameter are: `name`.

Parameter | Definition
--------- | ----------
name | Search by name of the space.


## Create a Space

>Create a space with name CPUs:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'name=CPUs' \
  -d 'tags=true' \
  -X POST \
  'https://metrics-api.librato.com/v1/spaces'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('email', 'token')
space = api.create_space("CPUs", tags="True")
print("Created '%s'" % space.name)
```

>Using JSON

```json
{
  "name": "CPUs"
}
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/spaces/129
```

>Response Body

```json
{
  "id": 129,
  "name": "CPUs"
}
```

#### HTTP Request

`POST https://metrics-api.librato.com/v1/spaces`

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

## Retrieve a Space

>Return the details of a Space with ID `129`:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/spaces/129'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('email', 'token')
space_info = api.get_space(129)
print space_info.name
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
  "charts": [
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

Returns the details of a specific space.

#### HTTP Request

`GET https://metrics-api.librato.com/v1/spaces/:id`


## Update a Space

>Change the name of the space to MEMORY:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'name=MEMORY' \
  -X PUT \
  'https://metrics-api.librato.com/v1/spaces/:id'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('email', 'token')
space = api.find_space('CPUs')
space.name = "MEMORY"
space.save()
```

>Using JSON

```json
{
  "name": "MEMORY"
}
```

>Response Code

```
204 No Content
```

Modifies a space by changing its name.

#### HTTP Request

`PUT https://metrics-api.librato.com/v1/spaces/:id`

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

## Delete Space

>Delete the space with ID `129`:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X DELETE \
  'https://metrics-api.librato.com/v1/spaces/129'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('email', 'token')
api.delete_space(129)
```
>Response Code

```
204 No Content
```

Delete the space identified by :id.

#### HTTP Request

`DELETE https://metrics-api.librato.com/v1/spaces/:id`

## List all Spaces

#### HTTP Request

`GET https://metrics-api.librato.com/v1/spaces`

>Retrieve all spaces:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/spaces'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('email', 'token')
spaces = api.list_spaces()
for s in spaces:
  print s.name
```

>Return all spaces owned by the user, with name matching ops:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/spaces?name=ops'
```

```ruby
Not available
```

```python
import librato
api = librato.connect('email', 'token')
spaces = api.list_spaces(name="ops")
for s in spaces:
  print(s.name)
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
  "spaces": [
    {
      "id": 4,
      "name": "staging_ops"
    }
  ]
}
```

Returns all spaces created by the user.
