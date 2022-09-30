const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// const session = require('express-session'); //not needed anymore
// const Store = require('connect-session-knex')(session) //not needed anymore

const restrict = require('./middleware/restricted.js');

const authRouter = require('./auth/auth-router.js');
const jokesRouter = require('./jokes/jokes-router.js');

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());
// server.use(session({
//     name: 'tegridy',
//     secret: 'randy marsh',
//     cookie: {
//         maxAge: 1000 * 60 * 60,
//         secure: false,
//         httpOnly: false
//     },
//     resave: false,
//     saveUninitialized: false,
//     store: new Store({
//         knex: require('../data/dbConfig'),
//         tablename: 'sessions', //defaults to 'sessions' if not decalred here
//         sidfieldname: 'sid', //defaults to 'sid' if not decalred here
//         createtable: true, //If a table does not exist, this will create one
//         clearInterval: 1000 * 60 * 60
//     })
// }))

server.use('/api/auth', authRouter);
server.use('/api/jokes', restrict, jokesRouter); // only logged-in users should have access!

module.exports = server;
