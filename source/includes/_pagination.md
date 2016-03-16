# Pagination

Many of the resources accessible through the Metrics REST APIs can contain large numbers of results when an INDEX operation is requested. To enable faster page load times and simple browsing of large result sets the APIs support pagination in a consistent fashion across resources.

## Request Parameters

>Example Request

>Request which returns the 2nd 10 metrics (would equal to page 2 where each page displays 10 metrics):

```shell
curl \
  -u user:token \
  https://metrics-api.librato.com/v1/metrics?offset=10&length=10
```

```ruby
Not available
```

>Response Code:

```
Code: 200
Headers: not applicable
```

>Response Body:

```json
{
  "query":{
    "found": 200,
    "length": 10,
    "offset": 10,
    "total": 200
  },
  "metrics": [
    // 10 Metrics...
  ]
}
```

There are several request parameters that you can use to control the pagination of the results. These apply in a consistent fashion across all paginated resources. All of the following request parameters have default values and are therefore optional:


Request Parameter | Definition
----------------- | ----------
offset<br>`optional` | Specifies how many results to skip for the first returned result. Defaults to 0.
length<br>`optional` | Specifies how many resources should be returned. The maximum permissible (and the default) length is 100.
orderby<br>`optional` | Order by the specified attribute. Permissible set of orderby attributes and the default value varies with resource type.
sort<br>`optional` | The sort order in which the results should be ordered. Permissible values are asc (ascending) and desc (descending). Defaults to asc.

## Response Parameters

>Example Request

>Request to get the third page for the query "api" where each page has a length of 10 metrics.

```shell
curl \
  -u user:token \
  https://metrics-api.librato.com/v1/metrics?name=api&offset=20&limit=10
```

```ruby
Not available
```

>Response Code:

```
Code: 200
Headers: not applicable
```

>Response Body:

```json
{
  "query":{
    "found": 50,
    "length": 10,
    "offset": 20,
    "total": 200
  },
  "metrics": [
    // 10 Metrics...
  ]
}
```

All paginated JSON responses contain a top-level element query that contains the following standard response parameters in addition to any additional response parameters specific to that request:

Response Parameter | Definition
------------------ | ----------
length | The maximum number of resources to return in the response.
offset | The index into the entire result set at which the current response begins. E.g. if a total of 20 resources match the query, and the offset is 5, the response begins with the sixth resource.
total | The total number of resources owned by the user.
found | The number of resources owned by the user that satisfy the specified query parameters. found will be less than or equal to total. Additionally if length is less than found, the response is a subset of the resources matching the specified query parameters.