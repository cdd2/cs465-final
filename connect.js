// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://chris123:chris123@cwcluster-wrkso.gcp.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");

//   // Test insert
// //   console.log("connected");
// //   let ins = {name: 'chris', email:'chris@gmail.com'};
// //   collection.insertOne(ins, (err, res) => {
// //     console.log("data insert");
// //   });

//     // Test find
//     collection.

//   client.close();
// });

'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const ENV = require('dotenv');
ENV.config();

// Init app
const app = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to mongodb
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true });
let db = mongoose.connection;

// Bring in models
let User = require('./models/user');

// Connect to db and check for errors
db.once('open', () => {
    console.log('Connected');
});

db.on('error', (err) => {
    console.log(err);
});

// Routes
app.get('/', (req, res) => {
    User.find({}, (err, users) => {
        if(err) {
            console.log(err);
        } else {
            console.log(users);
            res.send(users);
        }
    });
});

app.get('/register', (req, res) => {
    res.sendFile('register.html', {root: path.join(__dirname, './HtmlFiles')});
  });

app.post('/register', [
        check('email')
            .isEmail().withMessage('Must be a valid email'),
        check('password')
            .isLength({ min: 5 }).withMessage('Must be at least 5 chars long')
            .custom((val, {req, loc, path}) => {
                if(val !== req.body.password2) {
                    throw new Error('Passwords don\'t match');
                } else {
                    return val;
                }
            }).withMessage('Passwords must match')
], (req, res) => {    
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } else {
        let newUser = new User();

        newUser.email = req.body.email;
        newUser.password = req.body.password;

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err) {
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save((err) => {
                    if(err){
                        console.log(err);
                    } else {
                        res.redirect('/login');
                    }
                });
            });
        });
    }
});

app.get('/login', (req, res) => {
    res.sendFile('sign-in.html', {root: path.join(__dirname, './HtmlFiles')});
  });

// App Listen
if (module === require.main) {
    const server = app.listen(process.env.PORT || 8080, () => {
      const port = server.address().port;
      console.log(`App listening on port ${port}`);
    });
  }
  
  module.exports = app;