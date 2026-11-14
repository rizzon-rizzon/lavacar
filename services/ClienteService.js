const pool = require('../config/database');

class ClienteService {
  async listarTodos() {
    const query = `
      SELECT 
        c.id,
        c.nome,
        c.telefone,
        c.email,
        c.cpf,
        COALESCE(SUM(v.valor), 0) AS valor_total,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', v.id,
              'placa', v.placa,
              'modelo', v.modelo,
              'cor', v.cor,
              'servico', v.servico,
              'valor', v.valor,
              'metodo_pagamento', v.metodo_pagamento,
              'status', v.status,
              'data_entrada', v.data_entrada
            )
          ) FILTER (WHERE v.id IS NOT NULL), '[]'
        ) AS veiculos
      FROM clientes c
      LEFT JOIN veiculos v ON v.cliente_id = c.id OR LOWER(TRIM(v.cliente_nome)) = LOWER(TRIM(c.nome))
      GROUP BY c.id
      ORDER BY c.nome ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async criar(dados) {
    const { nome, telefone, email, cpf, placa, modelo, cor } = dados;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const queryCliente = `
        INSERT INTO clientes (nome, telefone, email, cpf)
        VALUES ($1, $2, $3, $4) RETURNING *
      `;
      const resCliente = await client.query(queryCliente, [
        nome,
        telefone,
        email || null,
        cpf || null,
      ]);
      const novoCliente = resCliente.rows[0];

      if (placa || modelo) {
        const queryVeiculo = `
          INSERT INTO veiculos (
            placa, modelo, cor, cliente_id, cliente_nome, cliente_telefone, 
            servico, valor, metodo_pagamento, status, data_entrada
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        `;
        await client.query(queryVeiculo, [
          placa ? placa.toUpperCase() : '',
          modelo || 'Não informado',
          cor || '',
          novoCliente.id,
          novoCliente.nome,
          novoCliente.telefone,
          'Cadastro Inicial',
          0.0,
          'PIX',
          0,
        ]);
      }

      await client.query('COMMIT');
      console.log('👤 Cliente salvo:', novoCliente.nome);
      return novoCliente;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new ClienteService();