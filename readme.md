# Jobly
A restful API that models a jobs database for tracking companies, jobs, and job applications. Users can retrieve information about companies and job postings. Logged in users can apply for jobs. Admins can post/update/delete jobs and manage users.

## Features
* Database of companies, jobs, job applications, and users in PostgreSQL
* Backend written in Node.js using Express
* RESTful API to interact with the database
* Implements Role based authorization system using signed JWTs
* Unit testing suite using Jest and Supertest
* SQL files of test data

## API URL
* Localhost API base URL: http://localhost:3001
* This API is not currently deployed
---
## Getting Started
Clone the repo by running
```bash
git clone https://github.com/Keparoo/Jobly
```
#### Key Dependencies

* node.js
* postgreSQL
* express 4.17.1
* pg 8.3.0
* jsonwebtoken 8.5.1
* jsonschema 1.2.6
* bcrypt 5.0.0
* cors 2.8.5
* jest 27.3.1
* supertest 5.0.0  
See the package.json file and package-lock.json file for more info on dependencies

### Installation and Database Setup  
To install npm packages:
```bash
npm i
```
---
## Database Setup
The project uses PostgreSQL databases
* Create two databases: One for **testing** and one for **development**:
```bash
createdb jobly
createdb jobly_test
```

To change the database URIs, edit the `config.js` file

To create the database tables and seed with data, from the project directory:
```bash
psql < jobly.sql
```
## Running the Server

Switch to the project directory  
To run in development mode:
```bash
npm run dev
```
To run the server in producton mode:
```bash
npm start
```
---

## Environment Variables
Create a .env file matching the template provided in the .env.example file.  
The SECRET_KEY= variable must be set in order to properly sign the JWTs that are used for authentication. Set this variable to a good random string. If nothing is set the config.js file falls back to a weak key suitable only for development.

---
## Authentication and Authorization
The project maintains a users table of registered users. Two roles are used for authentication: user and admin.

### Roles & Permissions
* Anonymous user (not logged in)  
Can view information about companies and job listings
* User (logged in)  
Can view information about companies and job listings
Can view their own user-table info
Can post a job application
* Admin (logged in)  
Can view all user, company, job, and application information
Can post/edit/delete user, company, job and application information

A Bearer token must be sent in all request headers requiring logged in or higher permissions

## Testing

To run the test suite:
```bash
npm test

```
To check the test-coverage of code:
```bash
npm coverage
```

There is currently 100% testing coverage.

---
## API

The API is a restful API that returns json

### Endpoints

GET /companies
* General:
    * Returns a list of all companies in database
    * Authorization required: none
    * Request Arguments: Accepts 3 optional query strings to filter results:
        * `minEmployees` (integer)
        * `maxEmployees` (integer)
        * `nameLike` (string) case-insensitive, will make partial matches
    * Filter queries other than the above will be ignored

```json
{ 
    "companies": 
    [
        { 
            "handle": "ibm",
            "name": "IBM corp",
             "description": "Big Blue",
            "numEmployees": 100000,
            "logoUrl": "http://www.ibm.com"
         },
    ]
}
```

GET /companies/<handle>
* General:
    * Returns info on company mathching handle
    * Authorization required: none
    * Request arguments: None

Sample Return:

```json
{ 
    "company": 
        { 
            "handle": "ibm",
            "name": "IBM corp",
             "description": "Big Blue",
            "numEmployees": 100000,
            "logoUrl": "http://www.ibm.com",
            "jobs":
                [
                    {
                    "id": 1,
                    "title": "Senior Developer",
                    "salary": 50000,
                    "equity": "0.2"
                    },
                ]
         }
}
```

POST /companies
* General:
    * Posts a new company to the database
    * Authorization required: admin
    * Request arguments: None
    * `name`, `handle` and `description` are required  

Sample Request Body:
```json
{
    "handle": "ibm",
    "name": "IBM corp",
    "description": "Big Blue",
    "numEmployees": 100000,
    "logoUrl": "http://www.ibm.com"
}
```
Sample Return:
```json
{
    "company":
    {
        "handle": "ibm",
        "name": "IBM corp",
        "description": "Big Blue",
        "numEmployees": 100000,
        "logoUrl": "http://www.ibm.com"
    }
}
```
PATCH /companies/<handle>
* General:
    * Updates a company in the database
    * Authorization required: admin
    * Request arguments: None
    * `name`, `description`, `numEmployees` and `logoUrl` may be updated
    * one or all field may be updated in a single query

Sample Request Body (each field is optional)
```json
    {
        "name": "IBM corp",
        "description": "Big Blue",
        "numEmployees": 100000,
        "logoUrl": "http://www.ibm.com"
    }
```
Sample Return:
```json
{
    "company":
        {
        "name": "IBM corp",
        "description": "Big Blue",
        "numEmployees": 100000,
        "logoUrl": "http://www.ibm.com"
        }
}
```
DELETE /companies/<handle>
* General:
    * Deletes a company from the database
    * Authorization required: admin
    * Request arguments: None
Sample Return:
```json
{
    "deleted": "ibm"
}
```
---
GET /jobs
* General:
    * Returns a list of all jobs in database
    * Authorization required: none
    * Request Arguments: Accepts 3 optional query strings to filter results:
        * `minSalary` (integer)
        * `hasEquity` (boolean) true indicates equity is > '0.0'
        * `title` (string) case-insensitive, will make partial matches
    * Filter queries other than the above will be ignored

Sample Return:
```json
{
    "jobs":
    [
        {
            "id": 1,
            "title": "Senior programmer",
            "salary": 100000,
            "equity": "0.2",
            "companyHandle": "ibm",
            "companyName": "IBM corp"
        },
    ]
}
```

GET /jobs/<job_id>
* General:
    * Returns information about the job matching job_id
    * Authorization required: none

Sample Return:
```json
{
    "job":
        {
            "id": 1,
            "title": "Senior programmer",
            "salary": 100000,
            "equity": "0.2",
            "company": {
                "handle": "ibm",
                "name": "IBM corp",
                "description": "Big Blue",
                "numEmployees": 10000,
                "logoUrl": "http://www.ibm.com"
            }
        }
}
```
POST /jobs
* General:
    * Posts a new job to the database
    * Authorization required: admin
    * Request arguments: None
    * `title` and `companyHandle` are required

Sample Request Body:
```json
{
    "title": "Senior developer",
    "salary": 100000,
    "equity": "0.2",
    "companyHandle": "ibm"
}
```
Sample Return:
```json
{
    "job": {
        "title": "Senior developer",
        "salary": 100000,
        "equity": "0.2",
        "companyHandle": "ibm"
    }
}
```
PATCH /jobs/<job_id>
* General:
    * Updates a job in the database
    * Authorization required: admin
    * Request arguments: None
    * `title`, `salary`, and `equity` may be updated
    * one or all field may be updated in a single query

Sample Request Body (each field is optional)
```json
{
    "title": "Senior developer",
    "salary": 100000,
    "equity": "0.2"
}
```
Sample Return:
```json
{
    "id": 1,
    "title": "Senior developer",
    "salary": 100000,
    "equity": "0.2",
    "companyHandle": "ibm"
}
```
DELETE /companies/<handle>
* General:
    * Deletes a job from the database
    * Authorization required: admin
    * Request arguments: None  

Sample Return:
```json
{
    "deleted": 1
}
```
---
GET /users
* General:
    * Returns a list of all users in database
    * Authorization required: admin
    * Request arguments: None

Sample Return:
```json
{
    "users": [
        {
            "username": "testuser",
            "firstName": "Chris",
            "lastName": "Robbins",
            "email": "chris@chris.com"
        },
    ]
}
```
GET /users/<username>
* General:
    * Returns information about the user matching username
    * Authorization required: user (logged in)
    * A user is authorized to view info from their own account
    * Admin may view any user's information

Sample Return:
```json
{
    "user": {
        "username": "testuser",
        "firstName": "Chris",
        "lastName": "Robbins",
        "isAdmin": false,
        "jobs": [
            1, 3, 47
        ]
    }
}
```
POST /users
* General:
    * Posts a new user to the database
    * This is not a registration endpoint: This is an admin only enpoint to manage users
    * Authorization required: admin
    * Request arguments: None
    * `username`, `firstName`, `lastName`, `password`, and `email` are required

Sample Request Body:
```json
        {
            "username": "testuser",
            "firstName": "Chris",
            "lastName": "Robbins",
            "password": "password1",
            "email": "chris@chris.com",
            "isAdmin": false
        }
```
Sample Return:
```json
{
    "user": {
        "username": "testuser",
        "firstName": "Chris",
        "lastName": "Robbins",
        "email": "chris@chris.com",
        "isAdmin": false
    },
    "token": "long-bearer-token-string"
}
```
PATCH /users/<username>
* General:
    * Updates a user in the database
    * Authorization required: current logged in user or admin
    * Request arguments: None
    * `firstName`, `lastName`, `password`, and `email` may be updated
    * one or all field may be updated in a single query

Sample Request Body (each field is optional)
```json
{
    "firstName": "Chris",
    "lastName": "Robbins",
    "password": "password1",
    "email": "chris@chris.com"
}
```

Sample Return:
```json
{
    "user": {
        "username": "testuser",
        "firstName": "Chris",
        "lastName": "Robbins",
        "email": "chris@chris.com",
        "isAdmin": false
    }
}
```
DELETE /users/<username>
* General:
    * Deletes a user from the database
    * Authorization required: current logged in user or admin
    * Request arguments: None  

Sample Return:
```json
{
    "deleted": "testuser"
}
```

POST /users/<username>/jobs/<job_id>
* General:
    * Posts a job application to the database
    * Authorization required: current logged in user or admin
    * Request arguments: None

Sample Return:
```json
{
    "applied": 1
}
```
---
POST /auth/token
* General:
    * Returns a JWT token which can be used to authenticate further requests
    * Authorization required: none
    * Request arguments: None

Sample Request Body:
```json
{
    "username": "testuser",
    "password": "password123"
}
```
Sample Return:
```json
{
    "token": "long-JWT-auth-token"
}
```
POST /auth/register
* General:
    * Registers a new user in the database
    * Authorization required: none
    * Request arguments: None
    * `username`, `password`, `firstName`, `lastName`, and `email` are required
    * Returns JWT token which can be used to authenticate further requests
Sample Request Body:
```json
{
    "username": "testuser",
    "password": "password123",
    "firstName": "Chris",
    "lastName": "Robbins",
    "email": "chris@chris.com"
}
```
Sample Return:
```json
{
    "token": "long-JWT-auth-token"
}
```
---
## Validation
Validation of input data is handled by the `JSON-SCHEMA` files located in the `schema` directory.

---
## Error Handling
The following errors are defined and handled in the `expressError.js` file
* ExpressError (extending Error)
* 404 NotFoundError
* 401 UnauthorizedError
* 400 BadRequestError
* 403 ForbiddenError

## Author
Kep Kaeppeler is the author of this project and documentation