const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const passport = require('passport');
const Strategy = require('passport-local').Strategy;

const Student = require('./models/student');
const Business = require('./models/business');
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/remotely');

passport.use(new Strategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, cb) {
    console.log(username, password);
    User.findOne({
      email: username
    }, function(err, user) {
      console.log(user);
      if (err) return cb(err);
      if (!user) return cb(null, false);

      user.verifyPassword(password, function(err2, isMatch) {
        if (err2) return cb(err2);
        if (!isMatch) return cb(null, false);

        return cb(null, user);
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const session = require('express-session');

app.use(session({ secret: 'hackercup', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/newuser', function(req, res) {
  res.render('newuser', { user: req.user });
});

app.get('/business', function(req, res) {
  res.render('business', { user: req.user });
});

app.get('/login', function(req, res) {
  res.render('login', { user: req.user });
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    console.log(info);
    if (err) {
      console.log(err);
      res.status(500).write('Well this didn\'t work out as expected.');
    } else if (!user) {
      res.redirect('/login');
    } else {
      req.logIn(user, function(err) {
        if (err) {
          console.log(err);
          res.status(500).write('Well this didn\'t work out as expected.');
        } else {
          res.redirect('/profile');
        }
      });
    }
  })(req, res, next);
});

app.post('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

app.post('/newuser', function(req, res, next) {
  var errors = [];
  if (!req.body.name)
    errors.push({ message: 'Please provide your full name.' });
  if (!req.body.email)
    errors.push({ message: 'Please provide your email.' });
  if (!req.body.password)
    errors.push({ message: 'Please provide a password for your account.' });
  if (req.body.name.length > 100)
    errors.push({ message: 'Please use a name that is less than 100 characters long.' });

  if (errors.length > 0) {
    res.render('newuser', { user: user, errors: errors });
  } else {
    var user = new User({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      type: 'student'
    });
    user.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).write('Well this didn\'t work out as expected.');
      }

      var student = new Student({
        user: user._id,
        birthDate: req.body.birthdate
      });
      student.save(function(err) {
        if (err) {
          console.log(err);
          return res.status(500).write('Well this didn\'t work out as expected.');
        }

        passport.authenticate('local', function(err, user, info) {
          console.log(info);
          if (err) {
            console.log(err);
            res.status(500).write('Well this didn\'t work out as expected.');
          } else if (!user) {
            res.redirect('/login');
          } else {
            req.logIn(user, function(err) {
              if (err) {
                console.log(err);
                res.status(500).write('Well this didn\'t work out as expected.');
              } else {
                res.redirect('/profile');
              }
            });
          }
        })(req, res, next);
      });
    });
  }
});

app.post('/business', function(req, res) {
  var errors = [];
  if (!req.body.name)
    errors.push({ message: 'Please provide your business name.' });
  if (!req.body.email)
    errors.push({ message: 'Please provide your email.' });
  if (!req.body.password)
    errors.push({ message: 'Please provide a password for your account.' });
  if (req.body.name.length > 100)
    errors.push({ message: 'Please use a name that is less than 100 characters long.' });

  if (errors.length > 0) {
    res.render('business', { user: req.user, errors: errors });
  } else {
    var user = new User({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      type: 'business'
    });
    user.save();
    var business = new Business({
      user: user._id,
      address: req.body.address,
      siteUrl: req.body.url
    });
    business.save();
    req.logIn(user, function(err) {
      if (err) {
        console.log(err);
        res.status(500).write('Well this didn\'t work out as expected.');
      } else {
        res.redirect('/profile');
      }
    });
  }
});

function authHandler(req, res, next) {
  if (!req.user) return res.redirect('/login');
  next();
}

app.get('/profile/:pid', authHandler, function(req, res) {
  res.render('portfolio', { user: req.user });
});

app.get('/profile', authHandler, function(req, res) {
  res.render('portfolio', { user: req.user });
});

app.get('/interstitial', function(req, res) {
  res.render('interstitial', { user: req.user });
});

app.get('/', function(req, res) {
  res.render('index', { user: req.user });
});

app.listen(port);
