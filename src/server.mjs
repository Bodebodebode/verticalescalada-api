import express from 'express';
import routes from './routes.mjs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from 'passport';


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(session({ secret: "secretcode", resave: true }));
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

/**
 * const hashedPassword = await bcrypt.hash(req.body.password, 10);
*/

app.listen(3333);

export default app;