const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;

import client from './database/db';
import usuario from './database/models/usuario';

passport.use(new FacebookStrategy(
    {
        clientID: '16361850600010990',//FACEBOOK_APP_ID,
        clientSecret: '1450a3b52a706ec6d05d89065288d306',//FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3333/auth/facebook/callback"
    },
    (request, accessToken, refreshToken, profile, done)=>{
    }
));

passport.use(new LocalStrategy(
    {
        usernameField: 'login',
        passwordField: 'senha'
    },
    async (login, senha, done)=>{

        // busca o usuario no db
        try{
            client
                .query(
                    'select * from usuario u where u.login = $1 and u.senha = $2',
                    [login, senha]
                )
                .then((res)=>{
                    const user = res.rows[0];
                    if(user === null || user === undefined) {
                        return done(null, false, 'Login ou senha inválidos');
                    }

                    return done(null, user);

                });
        } catch (err) { console.log(err); return done(err);}
    }
));

passport.serializeUser((user, done) => { //In serialize user you decide what to store in the session. Here I'm storing the user id only.
    done(null, user);
});

passport.deserializeUser((user, done) => { //Here you retrieve all the info of the user from the session storage using the user id stored in the session earlier using serialize user.
    client
        .query("select id_usuario, login, senha, id_aluno from usuario where id_usuario = $1", [user.id_usuario])
        .then((user)=>{
            done(null, user);
        })
        .catch(err=>{
            done(err);
        })
});

export default passport;