const express = require('express');
const bodyParser =require('body-parser');
const path = require('path');
const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');


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

//Temporary to mock user
app.use((req,res, next) => {
    User.findByPk(1)
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

//404 page for not found routes
app.use(errorController.get404);

// Relations between tables
Product.belongsTo(User, {constrainsts: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem})

// To tell sequelize to create tables on db
sequelize
.sync()
.then(result => {
    return User.findByPk(1);
}).then(user => {
    if(!user) {
        return User.create({name: 'Max', email: 'test@test.com'});
    }
    return Promise.resolve(user);
}).then(user => {
    return user.createCart();
}).then(cart => {
    app.listen(3000);
})
.catch(err => {
    console.log(err);
});
