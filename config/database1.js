const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgrres',
//  host: 'dpg-dbs9rgl6e07s7398ic5g-a',
  host: 'dpg-dbs9rgl6e07s7398ic5g-a.oregon-postgres.render.com',
  database: 'lavacar_v1ph',
  password: 'JKY5lodZ7mmO67SGR78vquSGtqRAx8bO',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ ERRO AO CONECTAR AO POSTGRESQL:', err.message);
  } else {
    console.log('✅ Conectado com sucesso ao banco de dados PostgreSQL!');
    release();
  }
});

module.exports = pool;