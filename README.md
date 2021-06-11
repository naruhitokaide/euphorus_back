# Country Happiness API Back End

This project was the backend for assignment 1 in CAB230 which required us to build endpoints to satisfy a predefined Swagger document. 

## Technologies used

- Express
- Node
- MySQL
- JWT
- Knex

## Get Started

You need MySQL version 8.0.24, Node and npm to run this project. 

From your command line, first clone this repo:

```bash
# Clone this repository
$ git clone https://github.com/ben04rogers/cab230assignment2.git

# Go into the repository
$ cd cab230assignment2
```

Then you can install the dependencies using NPM or Yarn:

Using NPM: 

```bash
# Install dependencies
$ npm install
```

Replace the SECRET_KEY in the .env file with a secret key. 

The data is available from the SQL dump file at https://drive.google.com/drive/u/1/folders/1ZUy0MKcLtuvOQ5b3NQWididxd2jU5Vw- and that will be necessary to create both the rankings, and users tables. These are the following fields on the database:

![databasefieldspic](https://user-images.githubusercontent.com/47819009/121647523-d8dce000-cad9-11eb-98a6-3629af2de0a8.PNG)

To start the application

```bash
# Start express server
$ npm start
```
