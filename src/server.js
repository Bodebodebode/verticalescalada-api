const express = require( 'express');
const routes = require( './routes');
const cors = require( 'cors');
const cookieParser = require( 'cookie-parser');
const bcrypt = require( 'bcrypt');
const session = require( 'express-session');
const bodyParser = require( 'body-parser');
const passport = require( 'passport');


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(session({ secret: "secretcode", resave: true , saveUninitialized: true }));
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

/**
 * const hashedPassword = await bcrypt.hash(req.body.password, 10);
*/

app.listen(process.env.PORT || 3333);

module.exports = app;