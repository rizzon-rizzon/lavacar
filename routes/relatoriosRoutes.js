const express = require('express');
const router = express.Router();
const relatorioService = require('../services/RelatorioService');

router.get('/clientes', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    const dados = await relatorioService.gastosPorCliente(data_inicio, data_fim);
    res.json(dados);
  } catch (err) {
    console.error('Erro na consulta GET /relatorios/clientes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;