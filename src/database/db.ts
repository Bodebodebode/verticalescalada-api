//@ts-nocheck
require('dotenv/config');

const { Client } = require('pg');

const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD
});

client.connect(
    (err)=>{
        if(err){ console.log(err); return; }
        console.log(err);
    }
);

export default client;