const express = require('express');
const bodyParser = require('body-parser');
var session = require('express-session');

const app = express();

app.use(session({ 
    secret: 'supersecretthingYES',
    cookie: { maxAge: 1800000 }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

const routes = require('./routes/routes')(app);

app.listen('8080', () => {
    console.log('Server started on port 8080');
});