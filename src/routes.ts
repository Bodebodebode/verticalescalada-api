//@ts-nocheck
import express from 'express';
import passport from './passport';
const passportjs = require('passport');
import client from './database/db'

import pessoa_fisica from './database/models/pessoa_fisica';
import usuario from './database/models/usuario';
import desserialize from './passport';


require('dotenv').config()

const routes = express.Router();

/**
 * Verifica se um pedido está autenticado
 *
 * Utilizado em rotas que necessitam da autenticação
 *
 * @param {*} req http request
 * @param {*} res http response
 * @param {*} next next
 */
const isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()) next();
    else res.json( { "isLoggedIn":false } );
}

/**
 * Contexto de exibição da aplicação
 *
 * Pega as informações do contexto a partir de um id_aluno para exibição de dados do usuário.
 *
 * @param {number} idAluno
 * @see models.aluno
 * @return {*}
 */
const getContext = async (idAluno:number)=>{
    return new Promise((resolve, reject)=>{
        client
            .query(
                "select pf.nome, u.login, encode(pf.foto, 'base64') foto from aluno a inner join pessoa_fisica pf on (a.id_pessoa_fisica = pf.id_pessoa_fisica) inner join usuario u on (a.id_aluno = u.id_aluno) where a.id_aluno = $1",
                [ idAluno ]
            )
            .then(res=>{ resolve(res.rows[0]) } )
            .catch(err=>{ reject(err) })
    })
}

routes.get('/', (request, response)=>{
    return response.json('helole');
});

/**
 * Rota de autenticação pelo facebook
 *
 */
routes.get('/auth/facebook', passport.authenticate('facebook'));

/**
 * Rota do callback da autenticação do facebook
 */
routes.get('/auth/facebook/callback', passport.authenticate('facebook',
    {
        successRedirect: '/',
        failureRedirect: '/login'
    }
));

/**
 * Rota de autenticação local
 *
 * @returns context
 */
routes.post('/auth/login',
        (req, res, next)=>{
        passport.authenticate('local',(err, user, info)=>{
            if(err) throw err;

            if(!user) res.json( { "error": "Usuário não encontrado! Verifique o login e senha." } )

            else{
                req.logIn(user, async err => {
                    if(err) throw err;
                    const ctx = await getContext(user.id_aluno)
                    res.json(
                        {
                            "isLoggedIn" : true,
                            "nome" : ctx["nome"],
                            "foto": ctx["foto"]
                        }
                    );
                })
            }
        })(req, res, next)
    }
);

/**
 * Rota de registro de usuários
 *
 * @param cpf
 * @param rg
 * @param nome
 * @param dt_nascimento
 * @param foto
 * @param login
 * @param senha
 */
routes.post('/user/register', (req, res, next)=>{
    const pf:pessoa_fisica = req.body.pessoa_fisica;
    const user:usuario = req.body.usuario;

    // verificações dos dados enviados
    if(!(pf.cpf && pf.nome && user.login && user.senha)) res.json( { "error":"Missing information" } );

    client
        .query(
            "select inserir_usuario_e_pf($1, $2, $3, $4, $5, $6, $7)",
            [ pf.cpf, pf.rg, pf.nome, pf.dt_nascimento, pf.foto, user.login, user.senha ]
        )
        .then(()=>{
            res.json("Adicionado com sucesso!");
        })
        .catch( (err)=>{ res.json( { "error": err } ) } );
});

/**
 * Rota que retorna um boolean com true caso o usuário esteja logado
 */
// routes.get('/isLoggedIn', isLoggedIn, (req, res, next)=>{
//     res.json( { "isLoggedIn": true} );
// })
routes.get( '/isLoggedIn', isLoggedIn, (req, res, next)=>{
        res.json( { "isLoggedIn": true} );
    }
)

/**
 * Rota que retorna o contexto
 */
routes.get('/getcontext', isLoggedIn, async (req, res, next)=>{
    res.json( await getContext(req.user.rows[0]["id_aluno"]) )
})

routes.get('/auth/logout', isLoggedIn, (req, res, next)=>{
    req.logout();
    res.send(true);
})

export default routes;