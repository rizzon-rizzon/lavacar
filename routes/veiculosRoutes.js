const express = require('express');
const router = express.Router();
const veiculoService = require('../services/VeiculoService');

router.get('/', async (req, res) => {
  try {
    const veiculos = await veiculoService.listarAtivos();
    res.json(veiculos);
  } catch (err) {
    console.error('Erro na consulta GET /veiculos:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const novoVeiculo = await veiculoService.criar(req.body);
    res.status(201).json(novoVeiculo);
  } catch (err) {
    console.error('Erro na consulta POST /veiculos:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const veiculoAtualizado = await veiculoService.atualizar(req.params.id, req.body);
    res.json(veiculoAtualizado);
  } catch (err) {
    console.error('Erro na consulta PUT /veiculos/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status, metodo_pagamento } = req.body;
    const veiculoAtualizado = await veiculoService.atualizarStatus(
      req.params.id,
      status,
      metodo_pagamento
    );
    res.json(veiculoAtualizado);
  } catch (err) {
    console.error('Erro na consulta PUT /veiculos/:id/status:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;