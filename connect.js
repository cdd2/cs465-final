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
const ENV = require('dotenv');
ENV.config();

// Init app
const app = express();

// Middleware
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

// Add Route
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

app.post('/register', (req, res) => {
    let user = new User();
    user.email = req.body.email;
    user.password = req.body.password;

    user.save((err) => {
        if(err){
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

// App Listen
if (module === require.main) {
    const server = app.listen(process.env.PORT || 8080, () => {
      const port = server.address().port;
      console.log(`App listening on port ${port}`);
    });
  }
  
  module.exports = app;