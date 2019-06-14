const express = require('express');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.get('/', function(req, res) {
  res.render('index');
});

app.listen(port);
