# Identity

## Commands

### Register

Data:

* `userId` - The id for the registering user
* `email` - The user's email address
* `passwordHash` - A hash of the user's password, hashed using `bcrypt`

Example:

```
{
  "id": "aea45ea1-bdcd-4cce-b610-931a66e67765",
  "type": "Register",
  "data": {
    "userId": "e90647af-8103-4fe9-ae1f-4766103cca54",
    "email": "user@example.com",
    "passwordHash": "$2b$10$IrxFcWAxwRQGcNbK5Zr03.aLvgFGSUSdeUGw86ONXoz3Nm.PUlycS",
  }
}
```

## Events

### Registered

Data:

* `userId` - The id for the registered user
* `email` - The user's email address
* `passwordHash` - A hash of the user's password, hashed using `bcrypt`

Example:

```
{
  "type": "Registered",
  "data": {
    "userId": "e90647af-8103-4fe9-ae1f-4766103cca54",
    "email": "user@example.com",
    "passwordHash": "$2b$10$IrxFcWAxwRQGcNbK5Zr03.aLvgFGSUSdeUGw86ONXoz3Nm.PUlycS",
  }
}
```

### RegistrationRejected

Data:

* `userId` - The id for the registering user
* `email` - The user's email address
* `passwordHash` - A hash of the user's password, hashed using `bcrypt`
* `reason` - The reason why the registration failed.

Example:

```
{
  "type": "RegistrationRejected",
  "data": {
    "userId": "e90647af-8103-4fe9-ae1f-4766103cca54",
    "email": "not an email",
    "passwordHash": "$2b$10$IrxFcWAxwRQGcNbK5Zr03.aLvgFGSUSdeUGw86ONXoz3Nm.PUlycS",
    "reason": "email was not valid"
  }
}
```