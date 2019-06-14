const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/remotely');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.get('/', function(req, res) {
  res.render('index');
});

app.listen(port);
