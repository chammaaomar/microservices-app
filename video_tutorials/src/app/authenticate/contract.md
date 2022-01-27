# Authenticate Application

## Stream Categories

|         |                   |
| ------- | ----------------- |
| entity  | `authentication`  |

## Events

### UserLoggedIn

Data:

* `userId` - The id of the user who logged in

Example:

```
{
  "id": "40f969ec-d6ea-466e-beb5-d37543db162e",
  "type": "UserLoggedIn",
  "data": {
    "userId": "e90647af-8103-4fe9-ae1f-4766103cca54"
  }
}
```

### UserLoginFailed

Data:

* `userId` - The id of the user who logged in
* `reason` - A string explaining why the attempt was a failure

We may not know the userId of the email address associated with the login attempt, because the user attempting to log in
may type a wrong email that isn't registered in our system. Additionally, we don't know the user attempting to actually log in,
we just know the email address they're attempting to log in with, which may belong to a different user. 

Example where we did know the user:

```
{
  "id": "a314d64f-6e4f-4a99-bfd4-5cf5afc52846",
  "type": "UserLoginFailed",
  "data": {
    "userId": "e90647af-8103-4fe9-ae1f-4766103cca54",
    "reason": "wrong password"
  }
}