const express = require('express');
const bodyParser =require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');
const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://root:p4ssw0rd@cluster0.ymwtf.mongodb.net/node-store?authSource=admin&replicaSet=atlas-2kbbg6-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';


//Routes import
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

//Define template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

//To parse request body
app.use(bodyParser.urlencoded({extended: false}));

//To serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

//to use session
app.use(session({
    secret: 'product store secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));

//Temporary to mock user
app.use((req,res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

// Call admin routes middleware
//routes start with /admin now
app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

//404 page for not found routes
app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
.then(result => {
    User.findOne().then(oldUser => {
        if(!oldUser) {
            const user = new User({
                name: 'Maria',
                email: 'maria.test.com',
                cart:{
                    items: []
                }
            });
            user.save();
        }
    });
    app.listen(3000);
}).catch(err => console.log(err));