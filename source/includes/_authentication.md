# Authentication

>Example: A user with an email address `example@librato.com` and an API token of `75AFDB82` will use the following curl command:

```shell
curl -u example@librato.com:75AFDB82 https://#{api}
```

> Or you may include the credentials in the URL (see the note about URL Encoding below):

```
curl https://example%40librato.com:75AFDB82@#{api}
```

>Note: API Tokens have been shortened for the purposes of this documentation. Your real API token will be longer.

The API requires [HTTP basic
authentication](http://en.wikipedia.org/wiki/Basic_access_authentication)
for every request. All requests must be sent over HTTPS.

Authentication is accomplished with a *user* and *token*
pair. *User* is the email address that you used to create your
Librato Metrics account and *token* is the API token that can be
found [on your account page](https://metrics.librato.com/account/api_tokens).

## URL Encoding

>To use URL encoding, use the following format:

```
https://user:token@#{api}
```

>Because the *user* value is an email address, it has to be escaped in order to form a valid URL. The `@` sign is represented by the `%40` entity. For example:

```shell
https://example%40librato.com:apitoken@#{api}
```

>Note: cURL automatically converts the `@` to a `%40` if you use the `-u` option, but not if you put authentication in the URL directly.

You can also include your *user* and *token* credentials in the URL with most clients. 

# Partner Admin Access

Example:

```shell
curl -u <user email>:<partner admin token> https://metrics-api.librato.com/v1/metrics
```

To administrate a user account created via the [partner API](#users), select the user's email address and use your partner admin user's token as the API token. 

See the [Managing Users section](#users) of the partner API for more information.