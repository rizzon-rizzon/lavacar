const pool = require('../config/database');

class FinanceiroService {
  async obterResumo() {
    const queryTotais = `
      SELECT 
        COALESCE(SUM(valor), 0) AS total_geral,
        COALESCE(SUM(CASE WHEN DATE(data_entrada) = CURRENT_DATE THEN valor ELSE 0 END), 0) AS total_hoje,
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', data_entrada) = DATE_TRUNC('month', CURRENT_DATE) THEN valor ELSE 0 END), 0) AS total_mes,
        COUNT(CASE WHEN DATE(data_entrada) = CURRENT_DATE AND valor > 0 THEN 1 END) AS qtd_hoje,
        COUNT(CASE WHEN DATE_TRUNC('month', data_entrada) = DATE_TRUNC('month', CURRENT_DATE) AND valor > 0 THEN 1 END) AS qtd_mes,
        COUNT(CASE WHEN DATE_TRUNC('month', data_entrada) = DATE_TRUNC('month', CURRENT_DATE) AND valor = 0 THEN 1 END) AS cortesias_mes
      FROM veiculos
      WHERE status = 3
    `;

    const queryMetodos = `
      SELECT 
        COALESCE(metodo_pagamento, 'PIX') AS metodo,
        SUM(valor) AS total,
        COUNT(*) AS quantidade
      FROM veiculos
      WHERE status = 3 AND DATE_TRUNC('month', data_entrada) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY COALESCE(metodo_pagamento, 'PIX')
    `;

    const queryDiarios = `
      SELECT 
        TO_CHAR(data_entrada, 'YYYY-MM-DD') AS data,
        COUNT(*) AS total_veiculos,
        COUNT(CASE WHEN valor > 0 THEN 1 END) AS veiculos_pagos,
        SUM(valor) AS total_faturado
      FROM veiculos
      WHERE status = 3
      GROUP BY TO_CHAR(data_entrada, 'YYYY-MM-DD')
      HAVING SUM(valor) > 0
      ORDER BY data DESC
      LIMIT 30
    `;

    const [resTotais, resMetodos, resDiarios] = await Promise.all([
      pool.query(queryTotais),
      pool.query(queryMetodos),
      pool.query(queryDiarios),
    ]);

    const resumoData = resTotais.rows[0];
    const totalMes = parseFloat(resumoData.total_mes) || 0;
    const qtdMes = parseInt(resumoData.qtd_mes) || 0;
    const ticketMedio = qtdMes > 0 ? totalMes / qtdMes : 0.0;

    return {
      resumo: {
        ...resumoData,
        ticket_medio: ticketMedio,
      },
      metodos_pagamento: resMetodos.rows,
      historico_diario: resDiarios.rows,
    };
  }
}

module.exports = new FinanceiroService();