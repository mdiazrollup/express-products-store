const express = require('express');
const bodyParser =require('body-parser');
const path = require('path');
const errorController = require('./controllers/error');

//Routes import
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

//Define template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

//To parse request body
app.use(bodyParser.urlencoded({extended: false}));

//To serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

// Call admin routes middleware
//routes start with /admin now
app.use('/admin',adminRoutes);
app.use(shopRoutes);

//404 page for not found routes
app.use(errorController.get404);

app.listen(3000);