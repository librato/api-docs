# Metrics

## Overview

Metrics are custom measurements stored in Librato's Metrics service. These measurements are created and may be accessed programatically through a set of RESTful API calls. There are currently two types of metrics that may be stored in Librato Metrics, `gauges` and `counters`.

### Gauges

Gauges capture a series of measurements where each measurement represents the value under observation at one point in time. The value of a gauge typically varies between some known minimum and maximum. Examples of gauge measurements include the requests/second serviced by an application, the amount of available disk space, the current value of $AAPL, etc.

### Counters

Counters track an increasing number of occurrences of some event. A counter is unbounded and always monotonically increasing in any given run. A new run is started anytime that counter is reset to zero. Examples of counter measurements include the number of connections made to an app, the number of visitors to a website, the number of a times a write operation failed, etc.

### Metric Properties

Some common properties are supported across all types of metrics:

Property | Definition
-------- | ----------
name | Each metric has a name that is unique to its class of metrics e.g. a gauge name must be unique amongst gauges. The name identifies a metric in subsequent API calls to store/query individual measurements and can be up to 255 characters in length. Valid characters for metric names are 'A-Za-z0-9.:-_'. The metric namespace is case insensitive.
period | The `period` of a metric is an integer value that describes (in seconds) the standard reporting period of the metric. Setting the period enables Metrics to detect abnormal interruptions in reporting and aids in analytics.
description | The description of a metric is a string and may contain spaces. The description can be used to explain precisely what a metric is measuring, but is not required. This attribute is not currently exposed in the Librato UI.
display_name | More descriptive name of the metric which will be used in views on the Metrics website. Allows more characters than the metric `name`, including spaces, parentheses, colons and more.
attributes | The [attributes hash](http://dev.librato.com/v1/metric-attributes) configures specific components of a metric's visualization.

### Measurement Properties

Each individual metric corresponds to a series of individual measurements. Some common properties are supported across all measurements.

Property | Definition
-------- | ----------
measure_time | The epoch time at which an individual measurement occurred with a maximum resolution of seconds.
value | The numeric value of an individual measurement. Multiple formats are supported (e.g. integer, floating point, etc) but the value must be numeric.
source | Source is an optional property that can be used to subdivide a common gauge/counter amongst multiple members of a population. For example the number of requests/second serviced by an application could be broken up amongst a group of server instances in a scale-out tier by setting the hostname as the value of source.
Source names can be up to 255 characters in length and must be composed of the following 'A-Za-z0-9.:-_'. The word all is a reserved word and cannot be used as a user source. The source namespace is case insensitive.

### Measurement Restrictions

Internally all floating point values are stored in double-precision format. However, Librato Metrics places the following restrictions on very large or very small floating point exponents:

* If the base-10 exponent of any floating point value is larger than `1 x 10^126`, the request will be aborted with a 400 status error code.

* If the base-10 exponent of any floating point value is smaller than `1 x 10^-130`, the value will be truncated to zero (0.0).