# Metric Attributes

Each metric instance can be configured past the basic name and description through a set of key/values pairs called attributes. These display attributes are particularly useful for configuring the metric visualization. The attributes described below are supported across all metric types.

Each metric supports a top-level parameter on [PUT operations](http://dev.librato.com/v1/put/metrics/:name) named attributes that comprises a set of key/value pairs.

The following sections list the available metric attributes.

## Display Attributes

Display Attribute | Definition
----------------- | ----------
`color` | Sets a default color to prefer when visually rendering the metric. Must be a seven character string that represents the hex code of the color e.g. #52D74C.
`display_max` | If a metric has a known theoretical maximum value, set `display_max` so that visualizations can provide perspective of the current values relative to the maximum value.
`display_min` | If a metric has a known theoretical minimum value, set `display_min` so that visualizations can provide perspective of the current values relative to the minimum value.
`display_units_long` | A string that identifies the unit of measurement e.g. Microseconds. Typically the long form of `display_units_short` and used in visualizations e.g. the Y-axis label on a graph.
`display_units_short` | A terse (usually abbreviated) string that identifies the unit of measurement e.g. uS (Microseconds). Typically the short form of `display_units_long` and used in visualizations e.g. the tooltip for a point on a graph.
`display_stacked` | A boolean value indicating whether or not multiple sources for a metric should be aggregated in a visualization (e.g. stacked graphs). By default counters have `display_stacked` enabled while gauges have it disabled.
`display_transform` | A linear formula that is run on each measurement prior to visualization. Useful for translating between different units (e.g. Fahrenheit -> Celsius) or scales (e.g. Microseconds -> Milliseconds). The formula may only contain: numeric characters, whitespace, parentheses, the letter x, and approved mathematical operators ('+', '-', '*', '/'). The regular expression used is `/^[\dxp()*+-\/ ]+$/`.

The formula is run on each measurement by substituting x with a given measurement's value and p (if present) with the number of seconds in the period the measurement covers. Although you could technically circumvent the lack of an exponential operator by multiplying x by itself (e.g. x*x), **YOU SHOULD NOT DO THIS**. Non-linear functions will not apply correctly against the automatically generated aggregate values meaning any visualization at a resolution other than the raw data stream would be at best garbage and at worst misleading.


## Gauge-only attributes

>For `summarize_funtion, if the values of the measurements to be rolled up are: `2`, `10`, `5`:

>average: `5.67`
>sum: `17`
>count: `3`
>min: `2`
>max: `10`

>The following example demonstrates how to set the metric attribute display_max on the metric temperature.

```shell
curl \
  -u <user>:<token> \
  -d 'attributes[display_max]=150' \
  -X PUT \
  https://metrics-api.librato.com/v1/metrics/temperature
```

Gauge Attribute | Definition
--------------- | ----------
`summarize_function` | Determines how to calculate values when rolling up from raw values to higher resolution intervals. Must be one of: 'average', 'sum', 'count', 'min', 'max'. If summarize_function is not set the behavior defaults to average.
`aggregate` | Enable service-side aggregation for this gauge. When enabled, measurements sent using the same *source* name will be aggregated into single measurements on an interval defined by the period of the metric. If there is no period defined for the metric then all measurements will be aggregated on a 60-second interval.
This option takes a value of true or false. If this option is not set for a metric it will default to false.