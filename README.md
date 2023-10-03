
# Urizen Password Manager


This the server for Urizen's Password Manager (UPW) and how its meant to be used
 Its uses and requests are as follows:

## API Reference

# USER OPERATIONS

# Create user

```http
  POST /api/v1/user 
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**.  |
|  `password` | `string`| **Required**|




## Login User

```http
  POST /api/v1/user
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**.|
| `password` | `string` | **Required**|

#### Login a specific user

Takes email and runs a check on databse and checks password and return a cookie

# Verify Email

```http
POST /api/v1/user/verify-email
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**.|
| `verificationToken` | `string` | **Required**|

## Verify Email
Takes the token sent to the email as a url and verifies the user (email) to let it use and access his/her page and passwords



# Forgot Password
```http
POST /api/v1/user/forgot-password
```
**Login Required**

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**.|

## Forgot Password
Send an email to the user to reset password


# Reset Password
```http
POST /api/v1/user/reset-password
```
**Login Required**

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`   | `string` | **Required**.|
| `token`  | `string` | **Required**|
| `password`  | `string` | **Required**|

### Reset Password
Takes the email,token and password from the url that was sent to the users email



# Update Information
```http
PUT api/v1/user/
```
**Login Required**

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**.|
| `oldPassword` | `string` | **Required**|
| `newPassword` | `string` | **Required**|

### Updates user Information
Takes in a new and old password and compares the old with what was already saved and changes it to the new password


# Delete User
```http
DELETE api/v1/user/
```
**Login Required**

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**.|
| `password` | `string` | **Required**|


### Delete User 
Deletes the User from the database





# PASSWORD OPERATIONS


# Create a Password Entry
```http
POST /api/v1/password
```
**Login Required**
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**.|
| `name`|  `string` | **Required** Name of the site the password is belongin to.|
| `password`      | `string` | **Required**. Password to the desired site|


### Create a password Entry
Opens a password entry for the user for the first time. It only accepts one Name field for the first entry.


# Add Password
```http
PATCH api/v1/password
```
**Login Required**
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**.|
| `name`|  `string` | **Required** Name of the site the password is belongin to.|
| `password`      | `string` | **Required**. Password to the desried site|

### Add Password
Adds extra password entries and appends to the existing password entries. This can take as many fields as wanted.


# Delete Password
```http
DELETE api/v1/password
```
**Login Required**
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**.|
| `name`|  `string` | **Required** Name of the site to the password user wants to Delete.|
| `password`      | `string` | **Required**.To the User|

### Delete password
Permanently Deletes the site from the database


# Deployment

To deploy this project run

```bash
  npm install
  npm start
```


## Feedback

If you have any feedback, please reach out to us at igamerryt@gmail.com


# License

[MIT](https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt)

