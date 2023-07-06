if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

// console.log(process.env.API_KEY);

const express = require('express');
const app = express();
const path= require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const { stat } = require('fs');
const session =require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const Joi = require('joi');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const mongoSanitize = require('express-mongo-sanitize');
const dbUrl = process.env.DB_URL;

const MongoStore = require('connect-mongo');

main().then(()=>{
    console.log("MonggoDB Connection Success!")
}).catch(err => console.log(err));

async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  await mongoose.connect(dbUrl);
}

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const store = MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 60 * 60,
        crypto: {
            secret: 'thisshouldbeabettersecret!'
        }
});

store.on("error", function (e){
    console.log("SESSION STORE ERROR", e)
});
    

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisisshouldbebettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`
];
const fontSrcUrls = [ `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/` ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/` ],
            childSrc   : [ "blob:" ]
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {

    // console.log(req.query);

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});     


app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req,res) => {
    res.render('home');
});

app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err,req,res,next) => {
    const { statusCode=500 } = err;
    if(!err.message) err.message = 'Ups, Something Went Wrong';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, ()=>{
    console.log("Listening on port 3000, Welcome to YELPCAMP");
});