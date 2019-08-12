'use strict';

const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('home.html', {root: path.join(__dirname, './HtmlFiles')});
});

app.get('/login', (req, res) => {
  res.sendFile('sign-in.html', {root: path.join(__dirname, './HtmlFiles')});
});

app.get('/about', (req, res) => {
  res.sendFile('about.html', {root: path.join(__dirname, './HtmlFiles')});
});

app.get('/plated-desserts', (req, res) => {
  res.sendFile('plated-desserts.html', {root: path.join(__dirname, './HtmlFiles')});
});

if (module === require.main) {
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;