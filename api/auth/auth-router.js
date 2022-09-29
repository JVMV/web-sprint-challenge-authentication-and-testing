const router = require('express').Router();
const db = require('../../data/dbConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = 'a secret that would usually be in an .env file'

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if(username && password) {
    const [pCheck] = await db('users').where('username', username)
    if(pCheck) {
      res.status(400).json({ message: 'Username taken' })
    } else {
      const hash = bcrypt.hashSync(password, 8)
      await db('users').insert({username: username, password: hash})  
      const [registered] = await db('users').where('username', username)
      res.status(201).json(registered)
    }
  }

  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const [check] = await db('users').where('username', username)
  if(check) {
    const pwCheck = bcrypt.compareSync(password, check.password)
    if(pwCheck === true) {
      res.status(200).json({ message: 'Logged in' })
    } else {
      res.status(401).json({ message: 'Login failed' })
    }
  } else {
    res.status(401).json({ message: 'Login failed' })
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

module.exports = router;
