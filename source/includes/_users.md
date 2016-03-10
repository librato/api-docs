# Users

## Overview

<aside class="notice">Note: The Users API will to be enabled before you can utilize it. Please <a href="mailto:support@librato.com">contact the Librato support team</a> for access.</aside>

The `users` API enables third party IaaS and PaaS vendors to create and manage user accounts on behalf of their customers.

### Managing Users

If you are a third-party partner that has the ability to manage your users, then it is easy to access the API as a particular user. Access is provided by swapping the user context of the authentication credentials for each request.

In the API, to operate in the context of one of your users, simply select the email address of the user you would like to access as the user field of the [authentication](#authentication) credentials. For the token credential, use the API token of your assigned partner admin user account.

### User Properties

Property | Definition
-------- | ----------
id | Each user has a unique ID.
email | Each user has a unique email address.
password | Each user has a password. Partners receive an initial password when a user is created and have the ability to reset it at any point in the future. Passwords may not be retrieved as they are never stored in plain text.
api_token | Each user has a unique API token. These tokens are used to authenticate access to Librato's API. This token should be handled securely and only shared with the associated user.
reference | The reference uniquely identifies a user within the partner's application.
name | An optional field that stores the user's name.
company | An optional field that stores the company that employs the user.
time_zone | An optional field that stores the time zone where the user resides.
created_at | When was the account created.
updated_at | When was the account last updated.

## Retrieve All Users

>Definition

```
GET https://metrics-api.librato.com/v1/users
```

>Example Request

>Return all users:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/users'
```

```ruby
Not available
```

>The user identified in the partner's application by `67523`:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/users?reference=67523'
```

```ruby
Not available
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

```
{
  "query": {
    "found": 1,
    "length": 1,
    "offset": 0,
    "total": 1
  },
  "users": [
    {
      "id": 123,
      "email": "foobar@baz.com",
      "api_token": "fda61ef1b4303d5ca8200630afcf90666d779afb79317c471403bfd31985d5d6",
      "reference": "67523",
      "name": "Foo Bar",
      "company": "Baz, Inc.",
      "country": "US",
      "time_zone": "America/Los_Angeles",
      "created_at": "2010-05-17 04:34:55",
      "updated_at": "2011-06-02 18:50:11"
    }
  ]
}
```

Returns all users managed by the partner.

### Parameters

The response is paginated, so the request supports our generic [Pagination Parameters](#pagination). Specific to users, the default value of the `orderby` pagination parameter is `id`, and the permissible values of the `orderby` pagination parameter are: `id`, `email`, `reference`.

Parameter | Definition
----------| ----------
email | A unique email address that identifies the user. It is recommended that you namespace user emails according to a partner associated domain name. For example: `user145@partner-domain.com`. This field is used as the credential for metric collectors, so changes to it should be made with caution as to not break existing collectors.
reference | A string that can be used to store a reference ID to this user in your partner database. The contents can be any string, but it must be unique for each user created in your partner account. If you do not require a reference, you can simply set this to the unique email address.

## Retrieve User

>Definition

```
GET https://metrics-api.librato.com/v1/users/:id
```

>Example Request

>Return user ID 123:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X GET \
  'https://metrics-api.librato.com/v1/users/123'
```

```ruby
Not available
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
  "email": "foobar@baz.com",
  "api_token": "fda61ef1b4303d5ca8200630afcf90666d779afb79317c471403bfd31985d5d6",
  "reference": "67523",
  "name": "Foo Bar",
  "company": "Baz, Inc.",
  "country": "US",
  "time_zone": "America/Los_Angeles",
  "created_at": "2010-05-17 04:34:55",
  "updated_at": "2011-06-02 18:50:11"
}
```

Return a specific user.

## Create User

>Definition

```
POST https://metrics-api.librato.com/v1/users
```

>Example Request

>Create a new user:

```shell
curl \
  -u <user>:<token> \
  -d 'email=foobar@baz.com&reference=5267&country=US' \
  -X POST \
  'https://metrics-api.librato.com/v1/users'
```

```ruby
Not available
```

>Response Code

```
201 Created
```

>Response Headers

```
Location: /v1/users/123
```

>Response Body

```curl
{
  "id": 123,
  "email": "foobar@baz.com",
  "api_token": "fda61ef1b4303d5ca8200630afcf90666d779afb79317c471403bfd31985d5d6",
  "reference": "67523",
  "name": "Foo Bar",
  "company": "Baz, Inc.",
  "country": "US",
  "time_zone": "America/Los_Angeles",
  "created_at": "2010-05-17 04:34:55",
  "updated_at": "2011-06-02 18:50:11",
  "password": "5ca7002b72be700b"
}
```

Create a new Librato user account.

### Headers

This specifies the format of the data sent to the API.

For HTML (default):

`Content-Type: application/x-www-form-urlencoded`

For JSON:

`Content-Type: application/json`

### Parameters

Parameter | Definition
-------- | ----------
email | A unique email address that identifies the user. It is recommended that you namespace user emails according to a partner associated domain name. For example: `user145@partner-domain.com`. This field is used as the credential for metric collectors, so changes to it should be made with caution as to not break existing collectors.
reference | A string that can be used to store a reference ID to this user in your partner database. The contents can be any string, but it must be unique for each user created in your partner account. If you do not require a reference, you can simply set this to the unique email address.
name<br>`optional` | A full name for this user, e.g. `John Smith`.
company<br>`optional` | Company this user works for.
country<br>`optional` | Country this user is from. Defaults to `US`.
time_zone<br>`optional` | The time zone this user is from, e.g. `UTC`.

## Update a User

>Definition

```
PUT https://metrics-api.librato.com/v1/users/:id
```

>Example Request

>Update a user:

```shell
curl \
  -u <user>:<token> \
  -d 'company=NewCompany' \
  -X PUT \
  'https://metrics-api.librato.com/v1/users/123'
```

```ruby
Not available
```

>Generate random password for user:

```shell
curl \
  -u <user>:<token> \
  -d 'password_reset=1' \
  -X PUT \
  'https://metrics-api.librato.com/v1/users/156'
```

```ruby
Not available
```

>Note that `password` and `password_reset` must not be set at the same time.

>Response

```
200 OK
204 No Content
```

>Headers

```
not applicable
```

>Response Body
<br><br>
>If `password_reset` was not provided, a `204 No Content` is returned and the body is empty.
<br><br>
>A successful `password_reset` will return a `200 OK` with the new password:

```curl
{
  "password": "69d07dbd7cb7302b"
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
email | A unique email address that identifies the user. It is recommended that you namespace user emails according to a partner associated domain name. For example: user145@partner-domain.com. This field is used as the credential for metric collectors, so changes to it should be made with caution as to not break existing collectors.
reference | A string that can be used to store a reference ID to this user in your partner database. The contents can be any string, but it must be unique for each user created in your partner account. If you do not require a reference, you can simply set this to the unique email address.
name | A full name for this user, e.g. `John Smith`.
company | Company this user works for.
country | Country this user is from. Defaults to `US`.
time_zone | The time zone this user is from, e.g. `UTC`.

### Password Management Parameters

The following optional parameters can be used to update the user's password. Only one of these options can be specified at a time. Specifying both of these options will return an error status code of `400`.

Parameter | Definition
--------- | ----------
password_reset | Setting this option (set to a value of `1`) will instruct the API to reset the user's password to a randomly generated string. If the reset is successful, the API will respond with a status of `200 OK` and the body will contain the new password.
password | Resets the user's password to this value. The new password must be at least six characters long. Unless you require strict control over passwords, the `password_reset` option is preferred over this option to ensure secure passwords.

## Delete User

>Definition

```
DELETE https://metrics-api.librato.com/v1/users/:id
```

>Example Request

>Delete the user `672`:

```shell
curl \
  -i \
  -u <user>:<token> \
  -X DELETE \
  'https://metrics-api.librato.com/v1/users/672'
```

```ruby
Not available
```

>Response Code

```
204 No Content
```

>Response Body

```
** NOT APPLICABLE **
```

Delete a user by ID.