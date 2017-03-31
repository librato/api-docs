# Alerts

Alerts are used to build actionable responses to changes in metric measurements. Alerts define conditions on the input measurements and are triggered when the value(s) of the input measurements cross a threshold or stop reporting. For example, an alert could be used to notify an administrator that response time for a given service is elevated above an acceptable range.

<aside class="notice">Our alerts endpoints currently support two versions of the alert data model. Version 2 supports our latest alerting features. Version 1 is legacy & deprecated.</aside>

## The Alert Object

### Alerts Properties

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
above | Condition is met when the stream goes above the specified threshold.
absent | Condition is met when the stream does not send a measurement for duration seconds.
below | Condition is met when the stream goes below the specified threshold.

All alert conditions have the following properties:

Property | Definition
-------- | ----------
type | One of above, absent, or below.
metric_name | The name of the metric this alert condition applies to.
tags<br>`optional` | A set of key/value pairs that describe the particular data stream. Tags behave as extra dimensions that data streams can be filtered and aggregated along. Examples include the region a server is located in, the size of a cloud instance or the country a user registers from. The full set of unique tag pairs defines a single data stream. Wildcards can be used here (e.g. prod-* will include all tags that begin with prod-). Data Streams matching the specified tag set can be grouped with the property `"grouped":true`. If left false each data stream matching the tag set will be evaluated individually.
detect_reset | *boolean*: If the summary_function is "derivative", this toggles the method used to calculate the delta from the previous sample. When set to "false" (default), the delta is calculated as simple subtraction of current - previous. <br><br>If "true" only increasing (positive) values will be reported. Any time the current value is less than the previous it is considered a reset of the counter and a derivative of zero is reported. This field is ignored for any setting of summary_function other than "derivative".

Additional properties for the 'above' alert condition type:

Property | Definition
-------------- | ----------
threshold | float: measurements over this number will fire the alert.
summary_function<br>`optional` | string: Indicates which statistic of an aggregated measurement to alert on. <br><br>For gauge metrics will default to "average", which is also the "value" of non-complex or un-aggregated measurements. If set, must be one of: [min, max, average, sum, count, derivative]. See [Instrument Stream Property summary_function](#instruments) for more details. <br><br>For counter metrics will default to "derivative", which is the delta between the most recent measurement and the one before it. If set, must be one of: [derivative, absolute_value].
duration | *integer*: Number of seconds that data for the specified metric/tag combination must be above the threshold for before the condition is met. All data points within the given duration must be above the threshold to meet this condition. This avoids a single spike from triggering the condition. <br><br>If unset, a single sample above the threshold will trigger the condition. The tracking duration begins with samples received after the alert condition is created or updated. Must be >= 60 seconds and <= 3600 seconds.

Additional properties for the 'absent' alert condition type:

Alert Property | Definition
-------------- | ----------
duration | *integer*: How many seconds data for the specified metric/tag combination must not be missing before the condition is met. This will only trigger for a given metric/tag combination after a measurement has been seen at least once. Must be >= 60 seconds and <= 3600 seconds. (Required)

Additional properties for the 'below' alert condition type:

Alert Property | Definition
-------------- | ----------
threshold | *float*: measurements below this number will fire the alert. (Required)
summary_function | *string*: Indicates which statistic of an aggregated measurement to alert on. <br><br>For gauge metrics will default to "average", which is also the "value" of non-complex or un-aggregated measurements. If set, must be one of: [min, max, average, sum, count, derivative]. See [Instrument Stream Property](instruments) `summary_function` for more details. <br><br>For counter metrics will default to "derivative", which is the delta between the most recent measurement and the one before it. If set, must be one of: [derivative, absolute_value].
duration | *integer*: Number of seconds that data for the specified metric/tag combination must be below the threshold for before the condition is met. All data points within the given duration must be below the threshold to meet this condition. This avoids a single drop from triggering the condition. <br><br>If unset, a single sample below the threshold will trigger the condition. The tracking duration begins with samples received after the alert condition is created or updated. Must be >= 60 seconds and <= 3600 seconds.

#### Alert Attributes

The attributes field on the alert accepts an optional map of key-value pairs and allows metadata to be associated with the alert. Some keys are used for special behavior:

Attribute | Definition
--------- | ----------
runbook_url | a URL for the runbook to be followed when this alert is firing. Used in the Librato UI if set.

Attributes can be unset by excluding their key when updating an alert.

## Create an Alert

>Create an alert named `production.web.frontend.response_time` with one condition which monitors the metric `web.nginx.response_time` and alerts whenever the value goes over 200.

>When the alert is triggered, the service identified by ID 849 (a Slack channel in this case) will be notified.

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
   "name":"production.web.frontend.response_time",
   "description":"Web Response Time",
   "conditions":[
      {
         "type":"above",
         "metric_name":"web.nginx.response_time",
         "threshold":200,
         "summary_function":"max",
         "tags":[
            {
               "name":"tag_name",
               "grouped":false,
               "values":[
                  "tag_value"
               ]
            }
         ]
      }
   ],
   "services":[
      849
   ],
   "attributes": {
        "runbook_url": "http://myco.com/runbooks/response_time"
   },
   "active":true,
   "md":true
}' \
"https://metrics-api.librato.com/v1/alerts"
```

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

#alternatively (trigger if max value is over 200 for 5min):
alert = api.create_alert(
    name="production.web.frontend.response_time",
    description="Web Response Time",
    version=2,
    services=["849"],
    attributes={"runbook_url":"http://mydomain.com/wiki/whattodo"},
    conditions=[
        {"metric_name":'web.nginx.response_time',
        "condition_type":'above',
        "threshold":200,
        "summary_function":'max',
        "duration":300}])
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
   "id":1234567,
   "name":"production.web.frontend.response_time",
   "description":"Web Response Time",
   "conditions":[
      {
         "id":19376030,
         "type":"above",
         "metric_name":"web.nginx.response_time",
         "source":null,
         "threshold":200.0,
         "summary_function":"max",
         "tags":[
            {
               "name":"tag_name",
               "grouped":false,
               "values":[
                  "tag_value"
               ]
            }
         ]
      }
   ],
   "services":[
      {
         "id":17584,
         "type":"slack",
         "settings":{
            "url":"https://hooks.slack.com/services/ABCDEFG/A1B2C3/asdfg1234"
         },
         "title":"librato-services"
      }
   ],
   "attributes":{
      "runbook_url":"http://myco.com/runbooks/response_time"
   },
   "active":true,
   "created_at":1484594787,
   "updated_at":1484594787,
   "version":2,
   "rearm_seconds":600,
   "rearm_per_signal":false,
   "md":true
}
```

Create an alert by setting the condition array parameters by providing a `metric_name`, `threshold`, and condition `type`.

#### HTTP Request

`POST https://metrics-api.librato.com/v1/alerts`

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### Parameters

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

## Retrieve an Alert

>Return alert with the `id` 123

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
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

>Response Body

```json
{
  "id": 123,
  "name": "production.web.frontend.response_time",
  "description":"Web Response Time",
  "conditions":[
      {
         "id":19375969,
         "type":"above",
         "metric_name":"web.nginx.response_time",
         "source":null,
         "threshold":200.0,
         "summary_function":"average",
         "tags":[
            {
               "name":"environment",
               "grouped":false,
               "values":[
                  "production"
               ]
            }
         ]
      }
   ],
  "services":[
      {
         "id":17584,
         "type":"slack",
         "settings":{
            "url":"https://hooks.slack.com/services/XYZABC/a1b2c3/asdf"
         },
         "title":"librato-services"
      }
   ],
  "attributes": {
    "runbook_url": "http://myco.com/runbooks/response_time"
  },
  "active":true,
  "created_at":1484588756,
  "updated_at":1484588756,
  "version":2,
  "rearm_seconds":600,
  "rearm_per_signal":false,
  "md":true
}
```

>Return all alerts owned by the user with `production` in the name:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
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
      "description":"Web Response Time",
      "conditions":[
            {
               "id":19375969,
               "type":"above",
               "metric_name":"librato.cpu.percent.interrupt",
               "source":null,
               "threshold":200.0,
               "summary_function":"average",
               "tags":[
                  {
                     "name":"name",
                     "grouped":false,
                     "values":[
                        "value"
                     ]
                  }
               ]
            }
         ],
      "services":[
        {
           "id":17584,
           "type":"slack",
           "settings":{
              "url":"https://hooks.slack.com/services/XYZABC/a1b2c3/asdf"
           },
           "title":"librato-services"
        }
     ],
      "attributes": {
        "runbook_url": "http://myco.com/runbooks/response_time"
      },
      "active":true,
       "created_at":1484588756,
       "updated_at":1484588756,
       "version":2,
       "rearm_seconds":600,
       "rearm_per_signal":false,
       "md":true
    }
  ]
}
```

Return the details of an alert (or group of alerts) by providing the `id` or `name`.

### Retrieve Status of Specific Alert

>Return the status for alert ID `120`:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
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

#### HTTP Request

`GET https://metrics-api.librato.com/v1/alerts/:alert_id/status`

## Update an Alert

>NOTE: This method requires the conditions hash. If conditions is not included in the payload, the alert conditions will be removed.

>To disable an alert:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{
   "id":6553597,
   "name":"my.alert.name",
   "description":"High CPU Load",
   "conditions":[
          {
            "id":19375969,
            "type":"above",
            "metric_name":"my.alert.name",
            "threshold":90,
            "summary_function":"average",
            "tags":[
              {
               "name":"my.environment",
               "grouped":false,
               "values":[
                  "production"
            ]
          }
        ]
      }
    ],
    "active":false
  }' \
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

>To enable an alert:

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{
   "id":6553597,
   "name":"my.alert.name",
   "description":"High CPU Load",
   "conditions":[
          {
            "id":19375969,
            "type":"above",
            "metric_name":"my.alert.name",
            "threshold":90,
            "summary_function":"average",
            "tags":[
              {
               "name":"my.environment",
               "grouped":false,
               "values":[
                  "production"
            ]
          }
        ]
      }
    ],
    "active":true
  }' \
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
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{
   "id":6553597,
   "name":"my.alert.name",
   "description":"A new description",
   "conditions":[
          {
            "id":19375969,
            "type":"above",
            "metric_name":"my.alert.name",
            "threshold":90,
            "summary_function":"average",
            "tags":[
              {
               "name":"my.environment",
               "grouped":false,
               "values":[
                  "production"
            ]
          }
        ]
      }
    ],
    "active":true
  }' \
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
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{
   "id":6553597,
   "name":"my.alert.name",
   "description":"A new description",
   "conditions":[
          {
            "id":19375969,
            "type":"above",
            "metric_name":"my.alert.name",
            "threshold":90,
            "summary_function":"average",
            "tags":[
              {
               "name":"my.environment",
               "grouped":false,
               "values":[
                  "production"
            ]
          }
        ]
      }
    ],
    "attributes": {
        "runbook_url": "http://myco.com/runbooks/response_time"
   },
    "active":true
  }' \
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

Update the specified alert.

#### HTTP Request

`PUT https://metrics-api.librato.com/v1/alerts/:id`

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### Parameters

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

## Notification Services

Librato provides many [notification services](https://www.librato.com/docs/kb/alert/alerts-intro/#notification-services) to alert your team by when an alert is triggered. At least one (but not lmiited to one) service must be tied to each alert.

### Associate a Service with an Alert

>Add the service identified by `ID 290` to the alert "my.alert.name" (ID `45`). When the alert is triggered, the service `290` will be notified.

>Note: To get a list of created services, view the section on [Retrieving all services](#retrieve-all-services).

```shell
curl \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -d 'service=290' \
  -X POST \
  'https://metrics-api.librato.com/v1/alerts/45/services'
```

```ruby
Not available
```

```python
import librato
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

Associates a single service with the alert identified by `:alert_id`.

#### HTTP Request

`POST https://metrics-api.librato.com/v1/alerts/:id/services`

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### Parameters

This route accepts a single parameter `service` that should be set to the ID of the [service](#services) to associate with this alert.

### Remove a Service from an Alert

#### HTTP Request

`DELETE https://metrics-api.librato.com/v1/alerts/:alert_id/services/:id`

>Remove service 209 from alert 123. From then on when alert 123 is triggered, the service 209 will no longer be triggered.

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
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

Remove the service identified by `:id` from the alert identified by `:alert_id`.


## Resolve an Alert

>Resolve alert ID `120`:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X POST \
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

Clears the alert specified using the alert `id`.

#### HTTP Request

`POST https://metrics-api.librato.com/v1/alerts/:alert_id/clear`

## Delete Alert

>Delete the alert `id` 123

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
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

Delete an alert by specifying a unique `id` or `name`.

#### HTTP Request

`DELETE https://metrics-api.librato.com/v1/alerts/:id`

## List all Alerts

>List all alerts:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
  -X GET \
  'https://metrics-api.librato.com/v1/alerts'
```

```ruby
Not available
```

```python
import librato
for alert in api.list_alerts():
    print(alert.name)
```

>Response Body

```json
{
  "query": {
    "offset": 0,
    "length": 2,
    "found": 2,
    "total": 7
  },
  "alerts": [
    {
      "id": 1400310,
      "name": "CPU.utilization",
      "description": null,
      "conditions": [
        {
          "id": 1016,
          "type": "above",
          "metric_name": "AWS.EC2.CPUUtilization",
          "source": "*prod*",
          "threshold": 90,
          "duration": 300,
          "summary_function": "max"
        }
      ],
      "services": [
        {
          "id": 1153,
          "type": "mail",
          "settings": {
            "addresses": "foo@domain.com,bar@domain.com"
          },
          "title": "Ops Team"
        }
      ],
      "attributes": {},
      "active": true,
      "created_at": 1394745670,
      "updated_at": 1394745670,
      "version": 2,
      "rearm_seconds": 600,
      "rearm_per_signal": false,
      "md": false
    },
    {
    // 1 more alert...
    }
  ]
}
```

>List the status of all alerts:

```shell
curl \
  -i \
  -u $LIBRATO_USERNAME:$LIBRATO_TOKEN \
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

Returns a list of alerts. Adding the `status` parameter returns a list of alert ids, grouped by those belonging to alerts which are in a triggered state and by those that have recently cleared.

#### HTTP Request

`GET https://metrics-api.librato.com/v1/alerts`

#### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination5). Specific to alerts, the default value of the `orderby` pagination parameter is `updated_at`, and the permissible values of the `orderby` pagination parameter are: `updated_at`.

#### Other Parameters

Parameter | Definition
--------- | ----------
version | Optional. Can be set to `1` or `2` and dictates whether to return v1 (deprecated) or v2 alerts. If unspecified, v2 alerts will be returned.
name | A search parameter that limits the results to alert names matching the substring. Search is case-insensitive.
