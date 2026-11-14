const express = require('express');
const router = express.Router();
const financeiroService = require('../services/FinanceiroService');

router.get('/', async (req, res) => {
  try {
    const dados = await financeiroService.obterResumo();
    res.json(dados);
  } catch (err) {
    console.error('Erro na consulta GET /financeiro:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;