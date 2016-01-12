# Response Codes & Errors

## HTTP Status Codes

The Librato API returns one of the following status codes for every request.

Error Code | Meaning | Definition
---------- | ------- | ----------
200 | OK | The request was processed successfully and the information is returned in the body in the desired format. This code gets returned after GET requests or PUT requests (if the PUT resulted in data being generated and returned). In case of a search (eg. for metrics) without search results, a 200 still gets returned.
201 | Created | The request was processed successfully. The resource was created and the `Location` variable in the header points to the resource. This code gets returned after POST requests only.
204 | No Content | The request was processed successfully. Since this code gets returned after PUT or DELETE requests only, there is no need for returning information in the response body.
400 | Bad Request | The request could not be parsed or the parameters were not valid. The request should be modified before resubmitting.
401 | Unauthorized | Challenges the user to provide authentication credentials.
403 | Forbidden | The request was not encrypted via SSL or the account is rate limited.
404 | Not Found | The request refers to a resource that either does not exist or the user does not have permissions to access (due to security through obscurity). If a search request gets sent, it will however not return a 404 if the API did not find resources matching the search query.
422 | Entity Already Exists | An attempt was made to create a new entity that matched an existing one. The request should be modified to use unique parameters (e.g., a different container name) or a PUT request should be made instead to modify the existing entity.
503 | Service Unavailable | In the rare occasion that we must put the API into maintenance mode for a service upgrade, the API can return a 503 error code. The API should be available again shortly so it is advised that you resubmit your request later.

## Error Messages

<h3 class="side">Error Message Structure</h3>

>Errors related to parameters are reported based on the attribute the error occurred on.

```json
{
  "errors": {
    "params": {
      "name":["is not present"],
      "start_time":["is not a number"]
    }
  }
}
```

>Errors related to the request itself are reported in an array structure with the key `request`.

```json
{
  "errors": {
    "request": [
      "Please use secured connection through https!",
      "Please provide credentials for authentication."
    ]
  }
}
```

>Service errors due to maintenance periods, for example, are reported in an array structure with the key `system`:

```json
{
  "errors": {
    "system": [
      "The API is currently down for maintenance. It'll be back shortly."
    ]
  }
}
```

The API reports errors in a the JSON format which makes it easier to parse and evaluate them. As of now, there are two kinds of errors: `params` and `request`.