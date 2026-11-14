const express = require('express');
const router = express.Router();
const authService = require('../services/AuthService');

router.post('/login', async (req, res) => {
  try {
    const { login, senha } = req.body;
    const usuario = await authService.autenticar(login, senha);
    res.json({
      mensagem: 'Login realizado com sucesso!',
      usuario,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await authService.listarUsuarios();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/registrar', async (req, res) => {
  try {
    const novoUsuario = await authService.cadastrarUsuario(req.body);
    res.status(201).json(novoUsuario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/usuarios/:id/permissoes', async (req, res) => {
  try {
    const atualizado = await authService.atualizarPermissoes(req.params.id, req.body);
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/usuarios/:id', async (req, res) => {
  try {
    await authService.excluirUsuario(req.params.id);
    res.json({ mensagem: 'Usuário removido com sucesso.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;