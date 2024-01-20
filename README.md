# Auth-service

This service acts as middleware for the rest of the services that require authentication.

You can also visit the rest of the services that are part of this project:

- [Boira-microservices-v1](https://github.com/Gguardiola/Boira-Microservices-v1)
- [GoodGifts Web Application](https://github.com/Gguardiola/goodgifts-nextjs-app)
- [GoodGifts REST API](https://github.com/Gguardiola/goodgifts-rest-api)


## Microservices architecture diagram (Boira v1)

<img src="https://content.pstmn.io/d120c632-cb99-4d02-9c2d-c0091865102e/Qm9pcmFNaWNyb3NlcnZpY2VzRGlhZ3JhbS12MS5wbmc=">

## Getting started guide

I have developed this service to be part of my microservices architecture to implement a token authentication system (JWT) in any other project I do. 

## API routes

#### Signup

```
  POST /auth/signup
```

Request body:

```json
{
    "email": "test@test.com",
    "username": "John",
    "lastname": "Doe",
    "birthday": "1990-10-10",
    "password": "123476789"
}
```

Response body:


```json
{
    "success": true,
    "message": "Signup successful"
}
```

#### Login

```
  POST /auth/login
```
Request body:

```json
{
    "email": "test@test.com",
    "password": "123476789"
}
```

Response body:


```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NzQ0NWE4OS02ZjcyLTQ5NjctYmM2Ny03YjA1M2ZjMDEyYjkiLCJpYXQiOjE3MDQyNDQzMzcsImV4cCI6MTcwNDQxNzEzN30.f5D1BvD0qGKI8sELSO2ehzePxfM1RAcwKWdqCAXQ9_s"
}
```
**NOTE:** the `token` should be stored (e.g. browser cookies/local storage).

#### Logout

```
  POST /auth/logout
```
| Header | Type     | Value                       |
| :-------- | :------- | :-------------------------------- |
| `Authentication`      | `token` | **Required**. User's token|

Response body:


```json
{
    "success": true,
    "message": "Logout successful"
}
```

After the logout, the `token` will be added to a blacklist until the expiration date (48h).

## Additional information

Once the user successfully login, the auth service will provide a JWT token that will be valid for 48 hours or until the user logs out. The token has the user id encrypted that will be checked using a middleware on every API call (see the microservices diagram above).

### Authentication error response

If an authentication token is missing, malformed, or invalid, you will receive an HTTP 401 Unauthorized response code.


