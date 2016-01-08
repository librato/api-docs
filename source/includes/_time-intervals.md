# Time Intervals

Librato tracks and stores several different types of measurements as time-series data. Each measurement corresponds to a particular point in time. Queries are typically made to request the values over some time interval that is a subset of the entire series e.g. the last hour, last Monday, etc. The search parameters described below may be used in different combinations to specify a time interval when making queries against [metrics](#metrics).

## Request Parameters

If an explicit interval (i.e. `start_time` to `end_time`) is specified, the response contains all measurements that fall within the interval. In this scenario the parameter `start_time` must be set, while `end_time` may be set or left to default to the current time.

An interval can also be implicitly specified through a `count` parameter. If `count` is set to N alongside with either (but not both) `start_time` or `end_time`, the response covers the time interval that covers N measurements. The value of `end_time` always defaults to the current time, so a request for the last N measurements only requires the `count` parameter set to N.

Request Parameter | Definition
----------------- | ----------
start_time | The [unix timestamp](http://en.wikipedia.org/wiki/Unix_time) indicating the start time of the desired interval.
end_time | The [unix timestamp](http://en.wikipedia.org/wiki/Unix_time) indicating the end time of the desired interval. If left unspecified it defaults to the current time.
count | The number of measurements desired. When specified as N in conjunction with `starttime`, the response contains the first N measurements after `starttime`. When specified as N in conjunction with `endtime`, the response contains the last N measurements before `endtime`.
resolution | A resolution for the response as measured in seconds. If the original measurements were reported at a higher resolution than specified in the request, the response contains averaged measurements.

## Pagination

>Example Request
<br><br>
>If the response includes the following `query` section it implies there are more points and that `start_time` should be set to 1305562061 to retrieve the next matching elements.

```json
"query" : {
    "next_time" : 1305562061
}
```

If a request does not include an explicit count and the matched data range includes more points than the maximum return size, then the response will include a pagination hint. In this case the response will include a parameter `next_time` in the `query` top-level response section. The `next_time` will be set to the epoch second start time of the next matching element of the original request. This hint serves two purposes:

1) It indicates there are more matching elements, but that the original request was truncated due to the response limit, and 

2) It provides the `start_time` value that should be used in a subsequent request. If the original request is resubmitted with the `start_time` set to the returned `next_time` the response will include the next set of matching elements in the set. It may require multiple requests to page through the entire set if the number of matching elements is large.

