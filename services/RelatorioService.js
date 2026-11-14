const pool = require('../config/database');

class RelatorioService {
  async gastosPorCliente(dataInicio, dataFim) {
    let filtroData = '';
    const params = [];

    if (dataInicio && dataFim) {
      filtroData = 'AND DATE(v.data_entrada) BETWEEN $1::date AND $2::date';
      params.push(dataInicio, dataFim);
    }

    const query = `
      SELECT 
        COALESCE(c.id, 0) AS cliente_id,
        COALESCE(c.nome, v.cliente_nome, 'Cliente Não Cadastrado') AS cliente_nome,
        COALESCE(c.telefone, v.cliente_telefone, '') AS cliente_telefone,
        COUNT(v.id) AS total_servicos,
        COALESCE(SUM(v.valor), 0) AS total_gasto,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', v.id,
            'placa', v.placa,
            'modelo', v.modelo,
            'servico', v.servico,
            'valor', v.valor,
            'metodo_pagamento', v.metodo_pagamento,
            'data_entrada', TO_CHAR(v.data_entrada, 'DD/MM/YYYY HH24:MI')
          ) ORDER BY v.data_entrada DESC
        ) AS servicos
      FROM veiculos v
      LEFT JOIN clientes c ON v.cliente_id = c.id OR LOWER(TRIM(v.cliente_nome)) = LOWER(TRIM(c.nome))
      WHERE v.status = 3 ${filtroData}
      GROUP BY COALESCE(c.id, 0), COALESCE(c.nome, v.cliente_nome, 'Cliente Não Cadastrado'), COALESCE(c.telefone, v.cliente_telefone, '')
      ORDER BY total_gasto DESC, cliente_nome ASC
    `;

    const { rows } = await pool.query(query, params);
    return rows;
  }
}

module.exports = new RelatorioService();