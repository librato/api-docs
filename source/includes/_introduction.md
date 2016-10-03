# Introduction

<h3 class="side">API Libraries</h3>

>There are many [collection agents and language bindings for Librato](https://www.librato.com/product/collection-agents). This guide covers documentation for the [Ruby](https://github.com/librato/librato-metrics) and [Python](https://github.com/librato/python-librato) libraries.

<h3 class="side example">Quick Start</h3>

>This example covers submitting and retrieving measurements from a specific metric. View the [Metrics section](#metrics) for more information on metric measurements and metadata.

>How to submit a measurement for the gauge metric `cpu_temp`:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'gauges[0][name]=cpu_temp' \
  -d 'gauges[0][value]=75' \
  -d 'gauges[0][source]=us-west' \
  -X POST \
  https://metrics-api.librato.com/v1/metrics
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate ENV['LIBRATO_USERNAME'], ENV['LIBRATO_TOKEN']
Librato::Metrics.submit cpu_temp: {source: 'us-west', value: 75}
```

```python
import librato
api = librato.connect(<user>, <token>)
api.submit("cpu_temp", 75, source='us-west')
```

>How to retrieve the last 4 measurements from the metric `cpu_temp` at a resolution of 60 seconds. This will return measurement data along with metric's metadata.

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/cpu_temp?count=4&resolution=60'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate ENV['LIBRATO_USERNAME'], ENV['LIBRATO_TOKEN']
metric = Librato::Metrics.get_metric :cpu_temp, count: 4, resolution: 60
puts metric["measurements"]
```

```python
import librato
api = librato.connect(<user>, <token>)
metric = api.get("cpu_temp", count=4, resolution=60)
print(metric.measurements)
```



Welcome to the official reference for Librato's
Application Programming Interface (API).

Librato is committed to enabling our
user community to manage their services configurations
through first-class REST APIs. Librato's own
clients (web, command line, etc) are built upon these APIs.

Detailed documentation for authentication and each individual API call can
be accessed through the menu. We invite suggestions, feature
requests or problem reports at
[our support forum](http://www.librato.com/docs/kb).
