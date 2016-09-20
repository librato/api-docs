# Authentication

>Example Request

>A user with an email address `example@librato.com` and an API token of `75AFDB82` will use the following command:

```shell
curl -u example@librato.com:75AFDB82 https://metrics-api.librato.com/v1/metrics
```

```ruby
require "librato/metrics"
Librato::Metrics.authenticate example@librato.com, 75AFDB82
```

```python
import librato
api = librato.connect('email', 'token')
```

>Or you may include the credentials in the URL (see the note about URL Encoding below):

```
curl https://example%40librato.com:75AFDB82@metrics-api.librato.com/v1/metrics
```

>Note: API Tokens have been shortened for the purposes of this documentation. Your real API token will be longer.

The API requires [HTTP basic
authentication](http://en.wikipedia.org/wiki/Basic_access_authentication)
for every request. All requests must be sent over HTTPS.

Authentication is accomplished with a *user* and *token*
pair. *User* is the email address that you used to create your
Librato Metrics account and *token* is the API token that can be
found [on your account page](https://metrics.librato.com/tokens).

## URL Encoding

>To use URL encoding, use the following format:

```
https://user:token@metrics-api.librato.com/v1/metrics
```

>Because the *user* value is an email address, it has to be escaped in order to form a valid URL. The `@` sign is represented by the `%40` entity. For example:

```
https://example%40librato.com:apitoken@metrics-api.librato.com/v1/metrics
```

>Note: cURL automatically converts the `@` to a `%40` if you use the `-u` option, but not if you put authentication in the URL directly.

You can also include your *user* and *token* credentials in the URL with most clients.
