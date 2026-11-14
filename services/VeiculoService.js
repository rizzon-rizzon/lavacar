const pool = require('../config/database');

class VeiculoService {
  async listarAtivos() {
    const query = `
      SELECT 
        v.id,
        v.placa,
        v.modelo,
        v.cor,
        v.cliente_id,
        v.cliente_nome,
        v.cliente_telefone,
        v.servico,
        v.valor,
        v.metodo_pagamento,
        v.status,
        v.data_entrada,
        c.nome AS cliente_nome_cadastrado, 
        c.telefone AS cliente_telefone_cadastrado
      FROM veiculos v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.status < 3
      ORDER BY v.id DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async criar(dados) {
    const {
      placa,
      modelo,
      cor,
      cliente_id,
      cliente_nome,
      cliente_telefone,
      servico,
      valor,
      metodo_pagamento,
      status,
      data_entrada,
    } = dados;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      let idClienteFinal = cliente_id || null;
      const nomeLimpo = cliente_nome ? cliente_nome.trim() : '';
      const telefoneLimpo = cliente_telefone ? cliente_telefone.trim() : '';

      if (!idClienteFinal && nomeLimpo.length > 0 && nomeLimpo !== 'Cliente Não Cadastrado') {
        const buscaCliente = await client.query(
          'SELECT id FROM clientes WHERE LOWER(TRIM(nome)) = LOWER($1) LIMIT 1',
          [nomeLimpo]
        );

        if (buscaCliente.rows.length > 0) {
          idClienteFinal = buscaCliente.rows[0].id;
        } else {
          const novoClienteRes = await client.query(
            'INSERT INTO clientes (nome, telefone) VALUES ($1, $2) RETURNING id',
            [nomeLimpo, telefoneLimpo]
          );
          idClienteFinal = novoClienteRes.rows[0].id;
          console.log('👤 Novo cliente cadastrado automaticamente pelo pátio:', nomeLimpo);
        }
      }

      const query = `
        INSERT INTO veiculos (
          placa, modelo, cor, cliente_id, cliente_nome, cliente_telefone, 
          servico, valor, metodo_pagamento, status, data_entrada
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11::timestamp, NOW())) 
        RETURNING *
      `;

      const values = [
        placa ? placa.trim().toUpperCase() : '',
        modelo && modelo.trim().length > 0 ? modelo.trim() : 'Não informado',
        cor ? cor.trim() : '',
        idClienteFinal,
        nomeLimpo.length > 0 ? nomeLimpo : 'Cliente Não Cadastrado',
        telefoneLimpo,
        servico && servico.trim().length > 0 ? servico.trim() : 'Lavagem Geral',
        parseFloat(valor) || 0.0,
        metodo_pagamento || 'PIX',
        status !== undefined ? parseInt(status) : 0,
        data_entrada || null,
      ];

      const { rows } = await client.query(query, values);
      await client.query('COMMIT');

      console.log('🚗 Veículo guardado com sucesso no PostgreSQL:', rows[0]);
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async atualizar(id, dados) {
    const {
      placa,
      modelo,
      cor,
      cliente_nome,
      cliente_telefone,
      servico,
      valor,
      metodo_pagamento,
      status,
    } = dados;

    const query = `
      UPDATE veiculos 
      SET placa = $1, modelo = $2, cor = $3, cliente_nome = $4, cliente_telefone = $5, 
          servico = $6, valor = $7, metodo_pagamento = $8, status = $9
      WHERE id = $10 RETURNING *
    `;

    const values = [
      placa ? placa.trim().toUpperCase() : '',
      modelo && modelo.trim().length > 0 ? modelo.trim() : 'Não informado',
      cor || '',
      cliente_nome || '',
      cliente_telefone || '',
      servico || '',
      parseFloat(valor) || 0.0,
      metodo_pagamento || 'PIX',
      status,
      id,
    ];

    const { rows } = await pool.query(query, values);
    console.log('✏️ Veículo atualizado:', rows[0]?.modelo);
    return rows[0];
  }

  async atualizarStatus(id, status, metodo_pagamento) {
    let query = 'UPDATE veiculos SET status = $1 WHERE id = $2 RETURNING *';
    let values = [status, id];

    if (metodo_pagamento) {
      query = 'UPDATE veiculos SET status = $1, metodo_pagamento = $2 WHERE id = $3 RETURNING *';
      values = [status, metodo_pagamento, id];
    }

    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

module.exports = new VeiculoService();