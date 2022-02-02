# Send Email Service

## Stream Categories

|         |                     |
| ------- | ------------------- |
| command | `sendEmail:command` |
| entity  | `sendEmail`         |

## Commands

Emails are sent from a specific email address, so no need for the caller to supply that.

### Send

Data:

* `emailId` - An identifier for the email
* `to` - The receiving email address
* `subject` - The subject line
* `text` - Plaintext version of the email
* `html` - HTML version of the body

Example:

```
{
  "id": "636401d3-6585-4887-8576-ec8003e6b380",
  "type": "Send",
  "data": {
    "emailId": "e0c6e804-ae9e-4c9c-bd55-b0c049a03993",
    "to": "lucky-recipient@example.com",
    "subject": "Rare investment opportunity",
    "text": "12 million US pounds stirling",
    "html": "<blink>12 million US pounds stirling</blink>"
  }
}
```


## Events

### Sent

This event is written after the email is sent. In the case the service crashes after sending the email but before
writing the event, on service restart, it will resend the email, so idempotence is NOT guaranteed. This tradeoff
was made as double-sending the email is preferable to not sending an email altogether.

Data:

* `emailId` - An identifier for the email
* `to` - The receiving email address
* `from` - The sending email address
* `subject` - The subject line
* `text` - Plaintext version of the email
* `html` - HTML version of the body

Example:

```
{
  "id": "c5f672bd-cf5f-4e6b-91ad-60a17cd6bbab",
  "type": "Sent",
  "data": {
    "emailId": "e0c6e804-ae9e-4c9c-bd55-b0c049a03993",
    "to": "lucky-recipient@example.com",
    "from": "exiled-prince@example.com",
    "subject": "Rare investment opportunity",
    "text": "12 million US pounds stirling",
    "html": "<blink>12 million US pounds stirling</blink>"
  }
}
```

### Failed

When sending an an email fails, we write this event.

Data:

* `emailId` - An identifier for the email
* `reason` - The reason why sending the email failed
* `to` - The receiving email address
* `from` - The sending email address
* `subject` - The subject line
* `text` - Plaintext version of the email
* `html` - HTML version of the body


Example:

```
{
  "id": "636401d3-6585-4887-8576-ec8003e6b380",
  "type": "Failed",
  "data": {
    "emailId": "e0c6e804-ae9e-4c9c-bd55-b0c049a03993",
    "reason": "Could not reach email provider",
    "to": "lucky-recipient@example.com",
    "from": "exiled-prince@example.com",
    "subject": "Rare investment opportunity",
    "text": "12 million US pounds stirling",
    "html": "<blink>12 million US pounds stirling</blink>"
  }
}
```