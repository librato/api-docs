# Alerts

## Overview

Alerts are used to build actionable responses to changes in metric measurements. Alerts define conditions on the input measurements and are triggered when the value(s) of the input measurements cross a threshold or stop reporting. For example, an alert could be used to notify an administrator that response time for a given service is elevated above an acceptable range.

<aside class="notice">Our alerts endpoints currently support two versions of the alert data model. Version 2 supports our latest alerting features. Version 1 is legacy & deprecated.</aside>

### Alerts

Alert Property | Definition
-------------- | ----------
id | Each alert has a unique numeric ID.
name | A unique name used to identify the alert. Must be 255 or fewer characters, and may only consist of `A-Za-z0-9.:-`. Dotted decimal notation (e.g. `production.web.frontend.responsetime`) is recommended.
version | Optional. Identifies the alert as v1 or v2. Defaults to '2'. For v1 alerts (deprecated) this must be submitted as '1'.
conditions | An array of conditions hashes (properties described in the [overview](#alerts)). NOTE: conditions are required for PUT operations.
services | An array of [services](#services) to notify for this alert (sent as list of IDs).
attributes | A key-value hash of metadata for the alert (described in alert attributes).
description | A string describing this alert.
active | Boolean: identifies whether the alert is active (can be triggered). Defaults to true.
rearm_seconds | Specifies the minimum amount of time between sending alert notifications, in seconds. A notification will be sent once the alert is triggered, and then will not be sent again until the rearm timer has elapsed, even if more measurements are received that would trigger the alert. Required to be a multiple of 60, and when unset or null will default to 600 (10 minutes).

### Alert Conditions

Each alert can have multiple alert conditions, each of which specifies a state which must be met for the alert to fire. Note an alert will fire when ALL alert conditions are met, not when a single condition is met.

We currently support three alert condition types:

Condition | Definition
--------- | ----------
above | Condition is met when the stream (metric/source pair) goes above the specified threshold.
absent | Condition is met when the stream does not send a measurement for duration seconds.
below | Condition is met when the stream goes below the specified threshold.

All alert conditions have the following properties:

Property | Definition
-------------- | ----------
type | One of above, absent, or below.
metric_name | The name of the metric this alert condition applies to.
source<br>`optional` | A source expression which identifies which sources for the given metric to monitor. If not specified all sources will be monitored. Wildcards can be used here (e.g. prod-* will include all sources that begin with prod-).
detect_reset | *boolean*: If the summary_function is "derivative", this toggles the method used to calculate the delta from the previous sample. When set to "false" (default), the delta is calculated as simple subtraction of current - previous. <br><br>If "true" only increasing (positive) values will be reported. Any time the current value is less than the previous it is considered a reset of the counter and a derivative of zero is reported. This field is ignored for any setting of summary_function other than "derivative".

### Additional properties for the 'above' alert condition type:

Property | Definition
-------------- | ----------
threshold | float: measurements over this number will fire the alert.
summary_function<br>`optional` | string: Indicates which statistic of an aggregated measurement to alert on. <br><br>For gauge metrics will default to "average", which is also the "value" of non-complex or un-aggregated measurements. If set, must be one of: [min, max, average, sum, count, derivative]. See [Instrument Stream Property summary_function](#instruments) for more details. <br><br>For counter metrics will default to "derivative", which is the delta between the most recent measurement and the one before it. If set, must be one of: [derivative, absolute_value].
duration | *integer*: Number of seconds that data for the specified metric/source combination must be above the threshold for before the condition is met. All data points within the given duration must be above the threshold to meet this condition. This avoids a single spike from triggering the condition. <br><br>If unset, a single sample above the threshold will trigger the condition. The tracking duration begins with samples received after the alert condition is created or updated. Must be >= 60 seconds and <= 3600 seconds.

### Additional properties for the 'absent' alert condition type:

Alert Property | Definition
-------------- | ----------
duration | *integer*: How many seconds data for the specified metric/source combination must not be missing before the condition is met. This will only trigger for a given metric/source combination after a measurement has been seen at least once. Must be >= 60 seconds and <= 3600 seconds. (Required)

### Additional properties for the 'below' alert condition type:

Alert Property | Definition
-------------- | ----------
threshold | *float*: measurements below this number will fire the alert. (Required)
summary_function | *string*: Indicates which statistic of an aggregated measurement to alert on. <br><br>For gauge metrics will default to "average", which is also the "value" of non-complex or un-aggregated measurements. If set, must be one of: [min, max, average, sum, count, derivative]. See [Instrument Stream Property](instruments) `summary_function` for more details. <br><br>For counter metrics will default to "derivative", which is the delta between the most recent measurement and the one before it. If set, must be one of: [derivative, absolute_value].
duration | *integer*: Number of seconds that data for the specified metric/source combination must be below the threshold for before the condition is met. All data points within the given duration must be below the threshold to meet this condition. This avoids a single drop from triggering the condition. <br><br>If unset, a single sample below the threshold will trigger the condition. The tracking duration begins with samples received after the alert condition is created or updated. Must be >= 60 seconds and <= 3600 seconds.

### Alert Attributes

The attributes field on the alert accepts an optional map of key-value pairs and allows metadata to be associated with the alert. Some keys are used for special behavior:

Attribute | Definition
--------------- | ----------
runbook_url | a URL for the runbook to be followed when this alert is firing. Used in the Librato UI if set.

Attributes can be unset by excluding their key when updating an alert.

## Retrieve All Alerts

>Definition

```
GET https://metrics-api.librato.com/v1/alerts
```

>Example Request

>Return all enabled alerts owned by the user with `production` in the name:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/alerts?name=production'
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
alerts = api.list_alerts(name="production")
for a in alerts:
  print(a.name)
```

>Response Code

```
200 OK
```

>Response Headers

```
** NOT APPLICABLE **
```

>Response Body

```json
{
  "query": {
    "found": 1,
    "length": 1,
    "offset": 0,
    "total": 1
  },
  "alerts": [
    {
      "id": 123,
      "name": "production.web.frontend.response_time",
      "conditions": [
        {
          "type": "above",
          "threshold": 200,
          "metric_name": "web.nginx.response_time"
        }
      ],
      "services": [
        {
          "id": 849,
          "title": "Notify Campfire Room",
          "name": "campfire"
        }
      ],
      "attributes": {
        "runbook_url": "http://myco.com/runbooks/response_time"
      },
      "active": true,
      "version": 2
    }
  ]
}
```

Returns all alerts created by the user.

### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination). Specific to alerts, the default value of the `orderby` pagination parameter is `updated_at`, and the permissible values of the `orderby` pagination parameter are: `updated_at`.

### Other Parameters

Parameter | Definition
--------- | ----------
version | Optional. Can be set to `1` or `2` and dictates whether to return v1 (deprecated) or v2 alerts. If unspecified, v2 alerts will be returned.
name | A search parameter that limits the results to metrics whose names contain a matching substring. Search is case-insensitive.

## Retrieve Alert by ID

>Example Request: Return alert ID 123

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/alerts/123'
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
alerts = api.list_alerts(id="123")
for a in alerts:
  print(a.name)
```

>Response Code

```
200 OK
```

>Response Headers

```
** NOT APPLICABLE **
```

>Response Body

```json
{
  "id": 123,
  "name": "production.web.frontend.response_time",
  "conditions": [
    {
      "type": "above",
      "threshold": 200,
      "metric_name": "web.nginx.response_time"
    }
  ],
  "services": [
    {
      "id": 849,
      "title": "Notify Campfire Room",
      "name": "campfire"
    }
  ],
  "attributes": {
    "runbook_url": "http://myco.com/runbooks/response_time"
  },
  "active": true,
  "version": 2
}
```

Returns a specific alert.

## Retrieve Status of Alerts

>Definition

```
GET https://metrics-api.librato.com/v1/alerts/status
```

>Example Request

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/alerts/status'
```

```ruby
Not available
```

```python
Not available
```

>Response Body

```json
{
    "cleared": [
        {
            "cleared_at": 1454108320,
            "id": 127
        }
    ],
    "firing": [
        {
            "id": 106,
            "triggered_at": 1413328283
        },
        {
            "id": 129,
            "triggered_at": 1444934147
        }
    ]
}
```

Returns a list of alert ids, grouped by those belonging to alerts which are in a triggered state and by those that have recently cleared.

## Retrieve Status of Specific Alert

>Definition

```
GET https://metrics-api.librato.com/v1/alerts/:alert_id/status
```

>Example Request

>Return the status for alert ID `120`:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/alerts/120/status'
```

```ruby
Not available
```

```python
Not available
```

>Response for an alert that is triggered:

```json
{
    "alert": {
        "id": 120
    },
    "status": "triggered"
}
```

>Response for an alert that is not triggered:

```json
{
    "alert": {
        "id": 121
    },
    "status": "ok"
}
```

Returns the status for a particular alert, specified by ID.

## Create an Alert

>Definition

```
POST https://metrics-api.librato.com/v1/alerts
```

>Example

>Create an alert named `production.web.frontend.response_time` with one condition which monitors the `metric web.nginx.response_time` and alerts whenever the value goes over 200.

>When the alert is triggered, the service identified by ID 849 (a campfire room in this case) will be notified.


```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
alert = api.create_alert("production.web.frontend.response_time")
alert.add_condition_for('web.nginx.response_time').above(200)
alert.add_service("849")
alert.save()
```

>JSON Request used to create alert:

```json
{
  "name": "production.web.frontend.response_time",
  "conditions": [
    {
      "type": "above",
      "threshold": 200,
      "metric_name": "web.nginx.response_time"
    }
  ],
  "services": [
    849
  ],
  "attributes": {
    "runbook_url": "http://myco.com/runbooks/response_time"
  },
  "version": 2
}
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/alerts/123
```

>Response Body

```json
{
  "id": 123,
  "name": "production.web.frontend.response_time",
  "conditions": [
    {
      "type": "above",
      "threshold": 200,
      "metric_name": "web.nginx.response_time"
    }
  ],
  "services": [
    {
      "id": 849,
      "title": "Notify Campfire Room",
      "name": "campfire"
    }
  ],
  "attributes": {
    "runbook_url": "http://myco.com/runbooks/response_time"
  },
  "active": true,
  "version": 2
}
```

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Parameters

Parameter | Definition
--------- | ----------
name | A unique name used to identify the alert. Must be 255 or fewer characters, and may only consist of 'A-Za-z0-9.:-'. Dotted decimal notation (e.g. *production.web.frontend.responsetime*) is recommended.
version | Optional. Can be set to `1` or `2` and dictates whether to return v1 (deprecated) or v2 alerts. If unspecified, v2 alerts will be returned.
conditions | An array of conditions hashes (properties described in the [overview](#alerts)).<br><br>NOTE: Conditions are required for PUT operations.
services | An array of [services](#services) to notify for this alert (sent as list of IDs).
attributes<br>`optional` | A key-value hash of metadata for the alert (described in alert attributes).
description<br>`optional` | A string describing this alert.
active<br>`optional` | Boolean: identifies whether the alert is active (can be triggered). Defaults to true.
rearm_seconds<br>`optional` | Specifies the minimum amount of time between sending alert notifications, in seconds. A notification will be sent once the alert is triggered, and then will not be sent again until the rearm timer has elapsed, even if more measurements are received that would trigger the alert. Required to be a multiple of 60, and when unset or null will default to 600 (10 minutes).

### Alert Conditions & Attributes

See details in the [alert overview](#alerts).

## Associate Service with Alert

>Definition

```
POST https://metrics-api.librato.com/v1/alerts/:id/services
```

>Example Request

>Add the service identified by `ID 290` to the alert "my.alert.name" (ID `45`). When the alert is triggered, the service `290` will be notified.

>Note: To get a list of created services, view the section on [Retrieving all services](#retrieve-all-services).

```shell
curl \
  -u <user>:<token> \
  -d 'service=290' \
  -X POST \
  'https://metrics-api.librato.com/v1/alerts/45/services'
```

```ruby
Not available
```

```python
Not available
alert = api.get_alert("my.alert.name")
alert.add_service("290")
alert.save()
```

>Response Code

```
201 Created
```

>Headers

```
Location: /v1/alerts/45/services/209
```

>Response Body

```
** NOT APPLICABLE **
```

Associates a single service with the alert identified by `:alert_id`.

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Parameters

This route accepts a single parameter `service` that should be set to the ID of the [service](#services) to associate with this alert.

## Modify Alert

>Definition

```
PUT https://metrics-api.librato.com/v1/alerts/:id
```

>Examples

>NOTE: This method requires the conditions hash. If conditions is not included in the payload, the alert conditions will be removed.

>Disable an alert:

```shell
curl \
  -u <user>:<token> \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"active": false, "name": "my.alert.name", "description": "Process went down", "conditions": [{"type": "absent", "metric_name": "service.alive", "source": "*", "duration": 900}]}' \
"https://metrics-api.librato.com/v1/alerts/123"
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
alert = api.get_alert("my.alert.name")
alert.active = "false"
alert.save()
```

>Enable an alert:

```shell
curl \
  -u <user>:<token> \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"active": true, "name": "my.alert.name", "description": "Process went down", "conditions": [{"type": "absent", "metric_name": "service.alive", "source": "*", "duration": 900}]}' \
"https://metrics-api.librato.com/v1/alerts/123"
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
alert = api.get_alert("my.alert.name")
alert.active = "true"
alert.save()
```

>Update the description of an alert:

```shell
curl \
  -u <user>:<token> \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"description": "A new description", "name": "my.alert.name", "conditions": [{"type": "absent", "metric_name": "service.alive", "source": "*", "duration": 900}], "active": true}' \
"https://metrics-api.librato.com/v1/alerts/123"
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
alert = api.get_alert("my.alert.name")
alert.description = "A new description"
alert.save()
```

>Update the runbook URL for an alert:

```shell
curl \
  -u <user>:<token> \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"attributes": {"runbook_url": "http://google.com"}, "name": "my.alert.name", "description": "A process went down.", "conditions": [{"type": "absent", "metric_name": "service.alive", "source": "*", "duration": 900}], "active": true}' \
"https://metrics-api.librato.com/v1/alerts/123"
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

>Response Headers

```
** NOT APPLICABLE **
```

>Response Body

```
** NOT APPLICABLE **
```

Update the specified alert.

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Parameters

Parameter | Definition
--------- | ----------
name | A unique name used to identify the alert. Must be 255 or fewer characters, and may only consist of `A-Za-z0-9.:-`. Dotted decimal notation (e.g. `production.web.frontend.responsetime`) is recommended.
version | Optional. Identifies the alert as v1 or v2. Defaults to '2'. For v1 alerts (deprecated) this must be submitted as '1'.
conditions | An array of conditions hashes (properties described in the [overview](#alerts)). NOTE: conditions are required for PUT operations.
services | An array of [services](#services) to notify for this alert (sent as list of IDs).
attributes<br>`optional` | A key-value hash of metadata for the alert (described in alert attributes).
description<br>`optional` | A string describing this alert.
active<br>`optional` | Boolean: identifies whether the alert is active (can be triggered). Defaults to true.
rearm_seconds<br>`optional` | Specifies the minimum amount of time between sending alert notifications, in seconds. A notification will be sent once the alert is triggered, and then will not be sent again until the rearm timer has elapsed, even if more measurements are received that would trigger the alert. Required to be a multiple of 60, and when unset or null will default to 600 (10 minutes).

### Alert Conditions & Attributes

See details in the [alert overview](#alerts).

## Resolve an Alert

>Definition

```
POST https://metrics-api.librato.com/v1/alerts/:alert_id/clear
```

>Example Request

>Resolve alert ID `120`:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/alerts/120/clear'
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

Clears the alert specified using the alert ID.

## Delete Alert

>Definition

```
DELETE https://metrics-api.librato.com/v1/alerts/:id
```

>Example Request

>Delete the alert ID 123

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/alerts/123'
```

```ruby
Not available
```

```python
import librato
api = librato.connect(<user>, <token>)
api.delete_alert("alert_name")
```
>Response Code

```
204 No Content
```
>Response Headers

```
** NOT APPLICABLE **
```
>Response Body

```
** NOT APPLICABLE **
```

Delete the specified alert.


## Remove Service from Alert


>Definition

```
DELETE https://metrics-api.librato.com/v1/alerts/:alert_id/services/:id
```

>Example Request

>Remove service 209 from alert 123. From then on when alert 123 is triggered, the service 209 will no longer be triggered.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/alerts/123/services/209'
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

>Response Headers

```
not applicable
```

>Response Body

```
not applicable
```

Remove the service identified by `:id` from the alert identified by `:alert_id`.
