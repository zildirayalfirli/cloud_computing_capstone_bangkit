# API DOCUMENTATION

---

### Overview
This repository contains the backend presentation for a cloud computing application using Node.js and Express. It is designed to work with Google Cloud services, specifically Firestore for data storage, Firebase Auth for Authentication and Google Cloud Storage for storing scanned images.

### Overview
Before running the application, make sure you have the following installed:
- Node.js
- Firebase Service Account key
- npm
- GCS Service Account key

### Installation

Clone the repository:
```bash
git clone https://github.com/zildirayalfirli/cloud_computing_capstone_bangkit.git
```
Install the dependency:
```bash
npm install
```
Running the Application:
```bash
npm run dev
npm run start
```
---

# Endpoint Documentation

## Endpoint Sign Up
- **URL:** `http://localhost:3000/api/auth/signup`
- **Method:** POST

This endpoint is used to sign up a user. When making a POST request to this endpoint, the request body should include the username, password, confirm password, and profile. Upon successful execution, the response will include message sucsess and a token.

### Example Request
```json
{
  "email": "user3@example.com",
  "password": "securepassword",
  "confirmPassword": "securepassword",
  "profile": {
    "name": "John Doe",
    "age": 30
  }
}
```

### Example Response
```json
{
    "message": "User created successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJJWVViTlVYaE44TnRDdU0yU1NxYmxoUFpITGIyIiwiaWF0IjoxNzMyNDM5NTkyfQ.kHUeHgSZjCXfTVSel7mAlaGtYne2pHm8R2vyzUfpx2k"
}
```


## Endpoint Login
- **URL:** `http://localhost:3000/api/auth/login`
- **Method:** POST

This endpoint is used to authenticate and login a user. The request body should include the necessary login credentials. Upon successful execution, the response will include the messages sucsess and a token.

### Example Request
```json
{
  "email": "user3@example.com",
  "password": "securepassword"
}
```

### Example Response
```json
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJJWVViTlVYaE44TnRDdU0yU1NxYmxoUFpITGIyIiwiaWF0IjoxNzMyNDM5Nzg4fQ.5C_YqTL3l-zTnJSTUu4eEBYBEVRFljnAN2o8VEX2UOI"
}
```


## Endpoint Login Anonymous
- **URL:** `http://localhost:3000/api/auth/login`
- **Method:** POST

This endpoint is used to authenticate and login a user using anonymous. Login by creates an anonymous session. Upon successful execution, the response will include the messages sucsess, a token, and uid.

### Example Request
```json
{
  "isAnonymous": true
}
```

### Example Response
```json
{
    "message": "Anonymous login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJpNXo4Q0VNczhqaFdBc3NvZHZtQzZDdVNoakQzIiwiaWF0IjoxNzMyNDM5OTc3fQ.JrF0hn--VMZm5gQTJTOOvnZrfgDWcI3KpVTcsNvVAK0",
    "uid": "i5z8CEMs8jhWAssodvmC6CuShjD3"
}
```


## Endpoint Update Profile Per User
- **URL:** `http://localhost:3000/api/auth/profile`
- **Method:** POST

Updates the authenticated user's profile.

### Authorization
- Auth Type : Bearer Token
- Token : Your Token

### Example Request
Authorization
- Auth Type : Bearer Token
- Token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJJWVViTlVYaE44TnRDdU0yU1NxYmxoUFpITGIyIiwiaWF0IjoxNzMyNDM5Nzg4fQ.5C_YqTL3l-zTnJSTUu4eEBYBEVRFljnAN2o8VEX2UOI

Body
```json
{
  "profile": {
    "name": "John Doe",
    "age": 39
  }
}
```

### Example Response
```json
{
    "message": "Profile updated successfully"
}
```
![image](https://github.com/user-attachments/assets/d869cceb-7482-4936-b255-ab754c5e2181)
![image](https://github.com/user-attachments/assets/fe5b3921-02eb-46e0-a612-1d43086baeaf)


## Endpoint Get Profile Per User
- **URL:** `http://localhost:3000/api/auth/profile`
- **Method:** GET

Fetches the authenticated user's profile.

### Authorization
- Auth Type : Bearer Token
- Token : Your Token

### Example Request
Authorization
- Auth Type : Bearer Token
- Token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJJWVViTlVYaE44TnRDdU0yU1NxYmxoUFpITGIyIiwiaWF0IjoxNzMyNDM5Nzg4fQ.5C_YqTL3l-zTnJSTUu4eEBYBEVRFljnAN2o8VEX2UOI

### Example Response
```json
{
    "profile": {
        "name": "John Doe",
        "age": 39
    }
}
```
![image](https://github.com/user-attachments/assets/438b1463-556a-4a30-8c75-cf910755dfe1)


## Endpoint Logout
- **URL:** `http://localhost:3000/api/auth/logout`
- **Method:** POST

Logout the authenticated user's profile.

### Authorization
- Auth Type : Bearer Token
- Token : Your Token

### Example Request
Authorization
- Auth Type : Bearer Token
- Token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJJWVViTlVYaE44TnRDdU0yU1NxYmxoUFpITGIyIiwiaWF0IjoxNzMyNDM5Nzg4fQ.5C_YqTL3l-zTnJSTUu4eEBYBEVRFljnAN2o8VEX2UOI

### Example Response
```json
{
    "message": "Logout successful"
}
```
![image](https://github.com/user-attachments/assets/78109936-3bd3-410b-b84e-c1c7993ca8b8)
