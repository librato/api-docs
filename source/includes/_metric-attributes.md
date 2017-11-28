# Metric Attributes

>The following example demonstrates how to set the metric attribute `display_max` on the metric temperature.

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'attributes[display_max]=150' \
  -X PUT \
  https://metrics-api.librato.com/v1/metrics/temperature
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.update_metric :temperature, attributes: { display_max: '150' }
```

>For `aggregate`, the following example demonstrates how to enable SSA for the metric speed.

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'attributes[aggregate]=true' \
  -X PUT \
  https://metrics-api.librato.com/v1/metrics/speed
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate <user>, <token>
Librato::Metrics.update_metric :speed, attributes: { aggregate: 'true' }
```

Each metric instance can be configured past the basic name and description through a set of key/values pairs called attributes. These display attributes are particularly useful for configuring the metric visualization.

Each metric supports a top-level parameter on [PUT operations](#update-a-metric-by-name) named attributes that comprises a set of key/value pairs.

The following sections list the available metric attributes.

## Attributes

Attribute | Definition
--------- | ----------
color | Sets a default color to prefer when visually rendering the metric. Must be a seven character string that represents the hex code of the color e.g. #52D74C.
display_max | If a metric has a known theoretical maximum value, set `display_max` so that visualizations can provide perspective of the current values relative to the maximum value.
display_min | If a metric has a known theoretical minimum value, set `display_min` so that visualizations can provide perspective of the current values relative to the minimum value.
display_units_long | A string that identifies the unit of measurement e.g. Microseconds. Typically the long form of `display_units_short` and used in visualizations e.g. the Y-axis label on a graph.
display_units_short | A terse (usually abbreviated) string that identifies the unit of measurement e.g. uS (Microseconds). Typically the short form of `display_units_long` and used in visualizations e.g. the tooltip for a point on a graph.
display_stacked | A boolean value indicating whether or not multiple metric streams should be aggregated in a visualization (e.g. stacked graphs). This option is disabled by default.
summarize_function | Determines how to calculate values when rolling up from raw values to higher resolution intervals. Must be one of: 'average', 'sum', 'count', 'min', 'max'. If summarize_function is not set the behavior defaults to average.<br><br>If the values of the measurements to be rolled up are: `2`, `10`, `5`:<br><br>* average: `5.67`<br>* sum: `17`<br>* count: `3`<br>* min: `2`<br>* max: `10`<br>
aggregate | Enable service-side aggregation for this metric. When enabled, measurements sent using the same *tag set* will be aggregated into single measurements on an interval defined by the period of the metric. If there is no period defined for the metric then all measurements will be aggregated on a 60-second interval.<br><br>This option takes a value of true or false. If this option is not set for a metric it will default to false.
