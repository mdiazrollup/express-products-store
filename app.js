const express = require('express');
const bodyParser =require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');
const errorController = require('./controllers/error');
const User = require('./models/user');
const multer = require('multer');

const MONGODB_URI = 'mongodb+srv://root:p4ssw0rd@cluster0.ymwtf.mongodb.net/node-store?authSource=admin&replicaSet=atlas-2kbbg6-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';

const fileStorage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, 'images');
    },
    filename:(req, file, cb) => {
        cb(null, new Date().toISOString() + '-' +file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

//Routes import
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

//CSRF attacks token protection
const csrfProtection = csrf();

//Define template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

//To parse request body
app.use(bodyParser.urlencoded({extended: false}));

//To parse multipart forms parser
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

//To serve static files from public
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

//to use session
app.use(session({
    secret: 'product store secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));
// should be after session init
app.use(csrfProtection);
// to save info in session for a limited time connect-flash package
app.use(flash());

// Middleware to set fields in all responses
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.user;
    res.locals.csrfToken = req.csrfToken();
    next();
});

//Temporary to mock user
app.use((req,res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        if(!user) {
            return next();
        }
        req.user = user;
        next();
    })
    .catch(err => {
        next(new Error(err));
    });
});

// Call admin routes middleware
//routes start with /admin now
app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

//500 page for errors. Not use after handling with middleware
//app.get('/500', errorController.get500);

//404 page for not found routes
app.use(errorController.get404);

//handle errors middleware. They are executed when next is use with a Error objet
app.use((error, req, res, next) => {
    //res.redirect('/500');
    // We use the render nstead of the redirect so we can use the handler with throw Error in sync code
    res.status(500).render('500', { pageTitle: 'Error!', path: '/500', isAuthenticated: req.session.user });
});

mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(3000);
}).catch(err => console.log(err));