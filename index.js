const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Student = require('./models/student');
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/remotely');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/newuser', function(req, res) {
  res.render('newuser');
});

app.post('/newuser', function(req, res) {
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
    res.render('newuser', { errors: errors });
  } else {
    var user = new User({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      type: 'student'
    });
    user.save();
    res.redirect('/');
  }
});

app.get('/profile/:pid', function(req, res) {
  res.render('profile');
});

app.get('/interstitial', function(req, res) {
  res.render('interstitial');
});

app.get('/', function(req, res) {
  res.render('index');
});

app.listen(port);
