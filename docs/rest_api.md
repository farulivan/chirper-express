# REST API

This document contains REST API specifications for each endpoint in this system.

Table of contents:

- [Register](#register)
- [Login](#login)
- [Refresh Access Token](#refresh-access-token)
- [Get Chirp List](#get-chirp-list)
- [Create Chirp](#create-chirp)
- [Get Chirp](#get-chirp)
- [Update Chirp](#update-chirp)
- [Delete Chirp](#delete-chirp)

Other than these endpoints, client need to handle [Generic Errors](#generic-errors) as well.

## Register

POST: `/api/users`

This endpoint is used for user registration. Upon successful registration, user can log in using [Login](#login) endpoint.

**Headers:**

- `Content-Type` => The value should be `application/json`.
- `Accept` => The value should be `application/json`.

**Body:**

- `name`, String => The name of the user. The acceptable length for the name is `3 <= name length <= 60`.
- `email`, String => The email of the user.
- `password`, String => The password used by user to login to the system. The acceptable length for the password is `8 <= password length <= 40`.

**Example Request:**

```json
POST /api/users
Content-Type: application/json
Accept: application/json

{
    "name": "Ahmad Sadeli",
    "email": "ahmad.sadeli@mail.com",
    "password": "12345678"
}
```

**Success Response:**

```json
HTTP/1.1 201 Created
Content-Type: application/json
Accept: application/json

{
    "id": 1,
    "name": "Ahmad Sadeli",
    "email": "ahmad.sadeli@mail.com"
}
```

**Error Responses:**

- Invalid Name (`400`)

  ```json
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
      "err": "ERR_INVALID_NAME",
      "msg": "name length should not be less than 3"
  }
  ```

  Client will receive this error when the value of the field `name` is invalid. Check the value of `msg` for the details.

- Invalid Email (`400`)

  ```json
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
      "err": "ERR_INVALID_EMAIL",
      "msg": "invalid email format"
  }
  ```

  Client will receive this error when the value of the field `email` is invalid. Check the value of `msg` for the details.

- Invalid Password (`400`)

  ```json
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
      "err": "ERR_INVALID_PASSWORD",
      "msg": "password should have at least 8 characters"
  }
  ```

  Client will receive this error when the value of the field `password` is invalid. Check the value of `msg` for the details.

- Email Already Registered (`409`)

  ```json
  HTTP/1.1 409 Conflict
  Content-Type: application/json

  {
      "err": "ERR_EMAIL_ALREADY_REGISTERED",
      "msg": "given email is already registered"
  }
  ```

  Client will receive this error when the submitted email is already registered on the database.

[Back to Top](#rest-api)

---

## Login

POST: `/api/session`

This endpoint is used by client to log in the user. Upon successful call, this endpoint returns `access_token` that will be used to authenticate subsequent API calls.

Notice that `access_token` has very short lifetime. In this system the lifetime duration is set to `5 minutes`. So after `5 minutes` the `access_token` will be expired.

When the current `access_token` is already expired, client must call [Refresh Access Token](#refresh-access-token) to generate the new `access_token` using `refresh_token` from the response.

> **Note:**
>
> Since `refresh_token` will be used every time the client want to generate new `access_token`, it should be stored in client storage indefinitely.

**Headers:**

- `Content-Type`, String => The value is `application/json`.
- `Accept`, String => The value is `application/json`.

**Body:**

- `email`, String => The email for login into the system.
- `password`, String => The password for given username.

**Example Request:**

```json
POST /session
Content-Type: application/json
Accept: application/json

{
    "email": "alice@mail.com",
    "password": "123456"
}
```

**Success Response:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 1,
    "email": "ahmad.sadeli@mail.com",
    "name": "Ahmad Sadeli",
    "access_token": "933e89b1-980b-4c98-8d73-18f7ccfac25d",
    "refresh_token": "8eebef3c-03e0-4ead-b78e-27bac3fc43c3"
}
```

**Error Responses:**

- Invalid Email (`400`)

  ```json
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
      "err": "ERR_INVALID_EMAIL",
      "msg": "invalid email format"
  }
  ```

  Client will receive this error when it submits value with invalid format for `email` field.

- Invalid Password (`400`)

  ```json
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
      "err": "ERR_INVALID_PASSWORD",
      "msg": "password must have length at least 8"
  }
  ```

  Client will receive this error when it submits invalid value for `password` field.

- Invalid Credentials (`401`)

  ```json
  HTTP/1.1 401 Unauthorized
  Content-Type: application/json

  {
      "err": "ERR_INVALID_CREDS",
      "msg": "incorrect username or password"
  }
  ```

  Client will receive this error when it submits an incorrect combination of username & password.

[Back to Top](#rest-api)

---

## Refresh Access Token

PUT: `/api/session`

This endpoint is used by client to replace expired `access_token` with the new one.

**Headers:**

- `Authorization`, String => The value is `Bearer {refresh_token}`.
- `Accept`, String => The value is `application/json`.

**Example Request:**

```json
PUT /session
Authorization: Bearer 8eebef3c-03e0-4ead-b78e-27bac3fc43c
Accept: application/json
```

**Success Response:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "access_token": "933e89b1-980b-4c98-8d73-18f7ccfac25d"
}
```

**Error Responses:**

- Invalid Refresh Token (`401`)

  ```json
  HTTP/1.1 401 Unauthorized
  Content-Type: application/json

  {
      "err": "ERR_INVALID_REFRESH_TOKEN",
      "msg": "invalid refresh token"
  }
  ```

  Client will receive this error when it submits an invalid refresh token. There are 2 causes of invalid refresh token: either the value is incorrect or the value is deemed expired by the system. If the client receives this error, the client should redirect the user to the login page.

[Back to Top](#rest-api)

---

## Get Chirp List

GET: `/api/chirps`

This endpoint returns maximum `100` latest chirps from the database. The chirps is not only the one created by the authenticated users, but also from others.

**Header:**

- `Authorization`, String => The value is `Bearer {access_token}`.
- `Accept`, String => The value is `application/json`.

**Example Request:**

```text
GET /chirps
Authorization: Bearer {access_token}
Accept: application/json
```

**Success Response:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "chirps": [
        {
            "id": 123,
            "message": "Hello World",
            "author": {
                "id": 1,
                "name": "Ahmad Sadeli",
                "email": "ahmad.sadeli@mail.com"
            },
            "created_at": 1708018743,
            "updated_at": 1708018743
        }
    ]
}
```

**Error Responses:**

No specific error response

[Back to Top](#rest-api)

---

## Create Chirp

POST: `/api/chirps`

This endpoint is used to create new chirp.

**Header:**

- `Authorization`, String => The value is `Bearer {access_token}`.
- `Content-Type`, String => The value is `application/json`.
- `Accept`, String => The value is `application/json`.

**Body:**

- `message`, String => The message for the chirp, the minimum length is `10` and the maximum length is `250`.

**Example Request:**

```json
POST /api/chirps
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json

{
    "message": "Hello World!"
}
```

**Success Response:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 123,
    "message": "Hello World",
    "author": {
        "id": 1,
        "name": "Ahmad Sadeli",
        "email": "ahmad.sadeli@mail.com"
    },
    "created_at": 1708018743,
    "updated_at": 1708018743
}
```

**Error Responses:**

- Invalid Message (`400`)

  ```json
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
      "err": "ERR_INVALID_MESSAGE",
      "msg": "the message must not empty"
  }
  ```

  Client will receive this error when it submits invalid `message`. Check `msg` for details.

[Back to Top](#rest-api)

---

## Get Chirp

GET: `/api/chirps/{chirp_id}`

This endpoint returns data for a chirp.

**Headers:**

- `Authorization`, String => The value is `Bearer {access_token}`.
- `Accept`, String => The value is `application/json`.

**Example Request:**

```text
GET /api/chirps/123
Authorization: Bearer {access_token}
Accept: application/json
```

**Success Response:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 123,
    "message": "Hello World",
    "author": {
        "id": 1,
        "name": "Ahmad Sadeli",
        "email": "ahmad.sadeli@mail.com"
    },
    "created_at": 1708018743,
    "updated_at": 1708018743
}
```

**Error Responses:**

No specific error responses.

[Back to Top](#rest-api)

---

## Update Chirp

PUT: `/chirps/{chirp_id}`

This endpoint is used to update existing chirp. When the user is not the author of the chirp, it returns [Forbidden Access Error](#forbidden-access-403).

**Header:**

- `Authorization`, String => The value is `Bearer {access_token}`.
- `Content-Type`, String => The value is `application/json`.
- `Accept`, String => The value is `application/json`.

**Body:**

- `message`, String => The new message for the chirp, the minimum length is `10` and the maximum length is `250`.

**Example Request:**

```json
POST /api/chirps/123
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json

{
    "message": "Hola World!"
}
```

**Success Response:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 123,
    "message": "Hola World!",
    "author": {
        "id": 1,
        "name": "Ahmad Sadeli",
        "email": "ahmad.sadeli@mail.com"
    },
    "created_at": 1708018743,
    "updated_at": 1708018776
}
```

**Error Responses:**

- Invalid Message (`400`)

  ```json
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
      "err": "ERR_INVALID_MESSAGE",
      "msg": "the message must not empty"
  }
  ```

  Client will receive this error when it submits invalid `message`. Check `msg` for details.

[Back to Top](#rest-api)

---

## Delete Chirp

DELETE: `/chirps/{chirp_id}`

This endpoint is used to delete existing chirp. When the user is not the author of the chirp, it returns [Forbidden Access Error](#forbidden-access-403).

**Header:**

- `Authorization`, String => The value is `Bearer {access_token}`.
- `Accept` => The value should be `application/json`.

**Example Request:**

```json
DELETE /api/chirps/123
Authorization: Bearer {access_token}
Accept: application/json
```

**Success Response:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 123
}
```

**Error Responses:**

- Not Found (`404`)

  ```json
  HTTP/1.1 404 Not Found
  Content-Type: application/json

  {
      "err": "NOT_FOUND",
      "msg": "resource is not found"
  }
  ```

  Client will receive this error when the chirp is not found in database.

[Back to Top](#rest-api)

---

## Generic Errors

This section specifies errors that can occurs in all API endpoints. Client is expected to also handle these errors properly.

### Bad Request (`400`)

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
    "err": "ERR_BAD_REQUEST",
    "msg": "invalid value of `type`",
}
```

Client will receive this error when there is an issue with client request. Check `msg` for the cause details.

### Invalid Access Token (`401`)

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
    "err": "ERR_INVALID_ACCESS_TOKEN",
    "msg": "invalid access token",
}
```

Client will receive this error when the submitted access token is no longer valid (expired) or the token is literally invalid (wrong access token).

### Forbidden Access (`403`)

```json
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
    "ok": false,
    "err": "ERR_FORBIDDEN_ACCESS",
    "msg": "user don't have authorization to access this resource",
    "ts": 1676989698
}
```

Client will receive this error when it tried to access resource that unauthorized for user.

[Back to Top](#rest-api)

---