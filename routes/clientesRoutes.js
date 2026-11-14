const express = require('express');
const router = express.Router();
const clienteService = require('../services/ClienteService');

router.get('/', async (req, res) => {
  try {
    const clientes = await clienteService.listarTodos();
    res.json(clientes);
  } catch (err) {
    console.error('Erro ao buscar resumo de clientes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const novoCliente = await clienteService.criar(req.body);
    res.status(201).json(novoCliente);
  } catch (err) {
    console.error('Erro ao cadastrar cliente:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;