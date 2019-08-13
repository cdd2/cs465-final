'use strict';

// Imports
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const ENV = require('dotenv');
ENV.config();

// Bring in models
let User = require('./models/user');

// Passport config
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      console.log("Verification function called");
      if (err) { return done(err); }
      console.log("No err");
      if (!user) { 
          console.log("No user");
          return done(null, false, { message: 'No user found' }); 
      }
      
      bcrypt.compare(password, user.password, function(err, isMatch) {
          if(err) throw err;
          console.log("No pass error");

          if(isMatch) {
              console.log("Pass match");
              return done(null, user);
          } else {
              console.log("Pass no match");
              return done(null, false); 
          }
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);    
  });
});

// Init App
const app = express();

// Link static files
app.use(express.static('public'));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  console.log(req.user);
  next();
});

// Connect to mongodb
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true });
let db = mongoose.connection;

// Connect to db and check for errors
db.once('open', () => {
  console.log('Connected');
});

db.on('error', (err) => {
  console.log(err);
});

// Add Routes
app.get('/', (req, res) => {
  res.sendFile('home.html', {root: path.join(__dirname, './HtmlFiles')});
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

      newUser.username = req.body.email;
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

app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
     successRedirect: '/', failureRedirect: '/login' 
  })(req, res, next);
});

app.get('/about', (req, res) => {
  res.sendFile('about.html', {root: path.join(__dirname, './HtmlFiles')});
});

app.get('/plated-desserts', (req, res) => {
  res.sendFile('plated-desserts.html', {root: path.join(__dirname, './HtmlFiles')});
});


// App Listen
if (module === require.main) {
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;