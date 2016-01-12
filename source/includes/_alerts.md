# Alerts

## Overview

Alerts are used to build actionable responses to changes in metric measurements. Alerts define conditions on the input measurements and are triggered when the value(s) of the input measurements cross a threshold or stop reporting. For example, an alert could be used to notify an administrator that response time for a given service is elevated above an acceptable range.

Note that our alerts endpoints currently support two versions of the alert data model. Version 2 is required for many of our new alerting features. Version 1 is legacy & deprecated.

### Alerts (Version 2)

Alert Property | Definition
-------------- | ----------
id | Each alert has a unique numeric ID.
name | A unique name used to identify the alert. Must be 255 or fewer characters, and may only consist of 'A-Za-z0-9.:-'. Dotted decimal notation (e.g. *production.web.frontend.responsetime*) is recommended.
version | Identifies the alert as v1 or v2. For v2 alerts this must be submitted as '2'.
conditions | An array of conditions hashes (properties described in alert conditions).
services | An array of services to notify for this alert (sent as list of IDs).
attributes | A key-value hash of metadata for the alert (described in alert attributes).
description | A string describing this alert.
active | Boolean: identifies whether the alert is active (can be triggered). Defaults to true.
rearm_seconds | Specifies the minimum amount of time between sending alert notifications, in seconds. A notification will be sent once the alert is triggered, and then will not be sent again until the rearm timer has elapsed, even if more measurements are recieved that would trigger the alert. Required to be a multiple of 60, and when unset or null will default to 600 (10 minutes).

### Alert Conditions

Each alert can have multiple alert conditions, each of which specifies a state which must be met for the alert to fire. Note an alert will fire when ALL alert conditions are met, not when a single condition is met.

We currently support three alert condition types:

Condition | Definition
--------- | ----------
above | Condition is met when the stream (metric/source pair) goes above the specified threshold.
absent | Condition is met when the stream does not send a measurement for duration seconds.
below | Condition is met when the stream goes below the specified threshold.

All alert conditions have the following properties:

Alert Property | Definition
-------------- | ----------
condition_type | One of above, absent, or below. (Required)
metric_name | The name of the metric this alert condition applies to. (Required)
source | A source expression which identifies which sources for the given metric to monitor. If not specified all sources will be monitored. Wildcards can be used here (e.g. prod-* will include all sources that begin with prod-).

Additional properties for the above alert condition type:

Alert Property | Definition
-------------- | ----------
threshold | float: measurements over this number will fire the alert. (Required)
summary_function | string: Indicates which statistic of an aggregated measurement to alert on. <br><br>For gauge metrics will default to "average", which is also the "value" of non-complex or un-aggregated measurements. If set, must be one of: [min, max, average, sum, count, derivative]. See [Instrument Stream Property summary_function](#instruments) for more details. <br><br>For counter metrics will default to "derivative", which is the delta between the most recent measurement and the one before it. If set, must be one of: [derivative, absolute_value].
duration | *integer*: Number of seconds that data for the specified metric/source combination must be above the threshold for before the condition is met. All data points within the given duration must be above the threshold to meet this condition. This avoids a single spike from triggering the condition. <br><br>If unset, a single sample above the threshold will trigger the condition. The tracking duration begins with samples received after the alert condition is created or updated. Must be >= 60 seconds and <= 3600 seconds.
detect_reset | *boolean*: If the summary_function is "derivative", this toggles the method used to calculate the delta from the previous sample. When set to "false" (default), the delta is calculated as simple subtraction of current - previous. <br><br>If "true" only increasing (positive) values will be reported. Any time the current value is less than the previous it is considered a reset of the counter and a derivative of zero is reported. This field is ignored for any setting of summary_function other than "derivative".

Additional properties for the absent alert condition type:

Alert Property | Definition
-------------- | ----------
duration | *integer*: How many seconds data for the specified metric/source combination must not be missing before the condition is met. This will only trigger for a given metric/source combination after a measurement has been seen at least once. Must be >= 60 seconds and <= 3600 seconds. (Required)

Additional properties for the below alert condition type:

Alert Property | Definition
-------------- | ----------
threshold | *float*: measurements below this number will fire the alert. (Required)
summary_function | *string*: Indicates which statistic of an aggregated measurement to alert on. <br><br>For gauge metrics will default to "average", which is also the "value" of non-complex or un-aggregated measurements. If set, must be one of: [min, max, average, sum, count, derivative]. See Instrument Stream Property summary_function for more details. <br><br>For counter metrics will default to "derivative", which is the delta between the most recent measurement and the one before it. If set, must be one of: [derivative, absolute_value].
duration | *integer*: Number of seconds that data for the specified metric/source combination must be below the threshold for before the condition is met. All data points within the given duration must be below the threshold to meet this condition. This avoids a single drop from triggering the condition. <br><br>If unset, a single sample below the threshold will trigger the condition. The tracking duration begins with samples received after the alert condition is created or updated. Must be >= 60 seconds and <= 3600 seconds.

### Alert Attributes

The attributes field on the alert accepts an optional map of key-value pairs and allows metadata to be associated with the alert. Some keys are used for special behavior:

Alert Attribute | Definition
--------------- | ----------
runbookurl | a _url for the runbook to be followed when this alert is firing. Used in the Librato UI if set.

Attributes can be unset by excluding their key when updating an alert.

### Alerts (v1, deprecated)

v1 alerts are deprecated and will be removed in the near future. Their properties are available here for reference:

Alert Property | Definition
-------------- | ----------
id | Each alert has a unique numeric ID.
entity_type | Type of metric this alert is for, either: counter or gauge.
entity_name | Name of the metric this alert applies to.
thresh_above_value | Defines a simple threshold value that triggers this alert if a single measurement value goes above this value.
thresh_below_value | Defines a simple threshold value that triggers this alert if a single measurement value drops below this value.
services | An array of services to notifiy for this alert (can be sent as list of IDs).
name | Allows one to specify a string that is used when displaying the alert to identify its purpose.
active | Boolean identifying whether the alert is active (can be triggered). Defaults to true.

## Retrieve All Alerts

>Definition

```
GET https://metrics-api.librato.com/v1/alerts
```

>Example Request: Return all alerts owned by the user with `production` in the name:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/alerts?version=2&name=production'
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
          "condition_type": "above",
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

### Pagination Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination). Specific to alerts, the default value of the `orderby` pagination parameter is `updated_at`, and the permissible values of the `orderby` pagination parameter are: `updated_at`.

### Other Parameters

Parameter | Definition
--------- | ----------
version | Should be set to either '1' or '2' and dictates whether to return v1 or v2 alerts. If unspecified will return v1 alerts for now - this will be changing to default to v2 alerts shortly.
name | v2 only - A search parameter that limits the results to metrics whose names contain a matching substring. Search is case-insensitive.

## Retrieve Specific Alert

>Example Request: Return alert ID 123

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/alerts/123'
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
      "condition_type": "above",
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

## Create an Alert

>Definition

```
POST https://metrics-api.librato.com/v1/alerts
```

>Example Request

>Create an alert named production.web.frontend.response_time with one condition which monitors the metric web.nginx.response_time and alerts whenever the value goes over 200.

>When the alert is triggered, the service identified by ID 849 (a campfire room in this case) will be notified.

>JSON request to create this alert

```json
{
  "name": "production.web.frontend.response_time",
  "conditions": [
    {
      "condition_type": "above",
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
      "condition_type": "above",
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

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### parameters

Parameter | Definition
--------- | ----------
name | A unique name used to identify the alert. Must be 255 or fewer characters, and may only consist of 'A-Za-z0-9.:-'. Dotted decimal notation (e.g. *production.web.frontend.responsetime*) is recommended.
version | Identifies the alert as v1 or v2. For v2 alerts this must be submitted as '2'.
conditions | An array of conditions hashes (properties described in alert conditions).
services | An array of [services](#services) to notify for this alert (sent as list of IDs).

### Optional Parameters

Parameter | Definition
--------- | ----------
attributes | A key-value hash of metadata for the alert (described in alert attributes).
description | A string describing this alert.
active | Boolean: identifies whether the alert is active (can be triggered). Defaults to true.
rearm_seconds | Specifies the minimum amount of time between sending alert notifications, in seconds. A notification will be sent once the alert is triggered, and then will not be sent again until the rearm timer has elapsed, even if more measurements are recieved that would trigger the alert. Required to be a multiple of 60, and when unset or null will default to 600 (10 minutes).

### Alert Conditions & Attributes

See details in the [alert overview](#alerts).

## Associate Service with an Alert

>Definition

```
POST https://metrics-api.librato.com/v1/alerts/:id/services
```

>Example Request: Add the service identified by ID 290 to the alert 45. When alert 45 is triggered, the service 290 will be notified.

```shell
curl \
  -u <user>:<token> \
  -d 'service=290' \
  -X POST \
  'https://metrics-api.librato.com/v1/alerts/45/services'
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

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### parameters

This route excepts a single parameter `service` that should be set to the ID of the [service](#services) to associate with this alert.

## Update Alert

>Definition

```
PUT https://metrics-api.librato.com/v1/alerts/:id
```

>Example Request: Update the name of alert ID 123.

```shell
curl \
  -u <user>:<token> \
  -d 'name=new.name' \
  -X PUT \
  'https://metrics-api.librato.com/v1/alerts/123'
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

#### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

#### parameters

Parameter | Definition
--------- | ----------
name | A unique name used to identify the alert. Must be 255 or fewer characters, and may only consist of 'A-Za-z0-9.:-'. Dotted decimal notation (e.g. *production.web.frontend.responsetime*) is recommended.
version | Identifies the alert as v1 or v2. For v2 alerts this must be submitted as '2'.
conditions | An array of conditions hashes (properties described in alert conditions).
services | An array of services to notify for this alert (sent as list of IDs).

### Optional Parameters

Parameter | Definition
--------- | ----------
attributes | A key-value hash of metadata for the alert (described in alert attributes).
description | A string describing this alert.
active | Boolean: identifies whether the alert is active (can be triggered). Defaults to true.
rearm_seconds | Specifies the minimum amount of time between sending alert notifications, in seconds. A notification will be sent once the alert is triggered, and then will not be sent again until the rearm timer has elapsed, even if more measurements are recieved that would trigger the alert. Required to be a multiple of 60, and when unset or null will default to 600 (10 minutes).

### Alert Conditions & Attributes

See details in the [alert overview](#alerts).

## Delete Alert

>Definition

```
DELETE https://metrics-api.librato.com/v1/alerts/:id
```

>Example Request: Delete the alert ID 123

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/alerts/123'
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

>Example Request: Remove service 209 from alert 123. From then on when alert 123 is triggered, the service 209 will no longer be triggered.

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/alerts/123/services/209'
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