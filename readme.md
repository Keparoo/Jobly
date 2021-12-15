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

* npm
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
### Database Setup
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
### Running the Server

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
### Environment Variables
Create a .env file matching the template provided in the .env.example file.  
The SECRET_KEY= variable must be set in order to properly sign the JWTs that are used for authentication. Set this variable to a good random string. If nothing is set the config.js file falls back to a weak key suitable only for development.
---
Authentication and Authorization
The project maintains a users table of registered users. Two roles are used for authentication: user and admin.

#### Roles & Permissions
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

### Testing

to run the test suite:
```bash
npm test
```

There is currently nearly 100% testing coverage
---
API

