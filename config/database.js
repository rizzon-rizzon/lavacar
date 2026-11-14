const { Pool } = require('pg');
require('dotenv').config();

// Em produção (Render), usa automaticamente a variável de ambiente DATABASE_URL.
// Localmente, usa a URL externa do Render configurada no seu arquivo .env local.
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgrres:JKY5lodZ7mmO67SGR78vquSGtqRAx8bO@dpg-dbs9rgl6e07s7398ic5g-a/lavacar_v1ph';
  //'postgresql://postgrres:JKY5lodZ7mmO67SGR78vquSGtqRAx8bO@dpg-dbs9rgl6e07s7398ic5g-a.oregon-postgres.render.com/lavacar_v1ph';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
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