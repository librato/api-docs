# Introduction

<h3 class="side">API Libraries</h3>

>There are many [collection agents and language bindings for Librato](https://www.librato.com/product/collection-agents). This guide includes examples for the [Ruby](https://github.com/librato/librato-metrics) and [Python](https://github.com/librato/python-librato) libraries.

<h3 class="side example">Quick Start</h3>

>This example covers submitting and retrieving measurements from a specific metric. View the [Metrics section](#metrics) for more information on metric measurements and metadata.

> Submit a measurement for the gauge metric `cpu`:

>JSON

```shell
curl -H "Content-Type: application/json" \
     -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
     -d $'
     {
       "gauges": [
         {
           "name": "cpu",
           "value": 75,
           "source": "my.machine"
         }
       ]
     }' \
    -X POST \
    https://metrics-api.librato.com/v1/metrics
```

>Form Encoded

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'gauges[0][name]=cpu' \
  -d 'gauges[0][value]=75' \
  -d 'gauges[0][source]=my.machine' \
  -X POST \
  https://metrics-api.librato.com/v1/metrics
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate ENV['LIBRATO_USERNAME'], ENV['LIBRATO_TOKEN']
Librato::Metrics.submit cpu: {source: 'my.machine', value: 75}
```

```python
import librato
api = librato.connect(<user>, <token>)
api.submit("cpu", 75, source='my.machine')
```

>Retrieve the last 5 measurements from the metric `cpu` at a resolution of 60 seconds. This will return measurement data along with metric metadata.

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/metrics/cpu?count=5&resolution=60'
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate ENV['LIBRATO_USERNAME'], ENV['LIBRATO_TOKEN']
metric = Librato::Metrics.get_metric :cpu, count: 5, resolution: 60
puts metric["measurements"]
```

```python
import librato
api = librato.connect(<user>, <token>)
metric = api.get("cpu", count=5, resolution=60)
print(metric.measurements)
```

Welcome to the official reference for the Librato
Application Programming Interface (API). Detailed documentation for authentication and each individual API call can
be accessed through the menu.
