const pool = require('../config/database');

class AuthService {
  async autenticar(login, senha) {
    if (!login || !senha) {
      throw new Error('Informe o usuário e a senha.');
    }

    const query = `
      SELECT id, nome, login, cargo, permissoes
      FROM usuarios
      WHERE LOWER(TRIM(login)) = LOWER(TRIM($1)) AND senha = $2
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [login, senha]);

    if (rows.length === 0) {
      throw new Error('Usuário ou senha inválidos.');
    }

    return rows[0];
  }

  async listarUsuarios() {
    const query = `
      SELECT id, nome, login, cargo, permissoes, criado_em
      FROM usuarios
      ORDER BY id ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async cadastrarUsuario({ nome, login, senha, cargo, permissoes }) {
    if (!nome || !login || !senha) {
      throw new Error('Nome, login e senha são obrigatórios.');
    }

    const permissoesPadrao = permissoes || {
      patio: true,
      clientes: true,
      financeiro: false,
      relatorios: false,
      usuarios: false,
    };

    const query = `
      INSERT INTO usuarios (nome, login, senha, cargo, permissoes)
      VALUES ($1, LOWER(TRIM($2)), $3, $4, $5::jsonb)
      RETURNING id, nome, login, cargo, permissoes
    `;

    const { rows } = await pool.query(query, [
      nome.trim(),
      login,
      senha,
      cargo || 'Operador',
      JSON.stringify(permissoesPadrao),
    ]);

    return rows[0];
  }

  async atualizarPermissoes(id, { cargo, permissoes, senha }) {
    if (senha && senha.trim().length > 0) {
      const query = `
        UPDATE usuarios 
        SET cargo = $1, permissoes = $2::jsonb, senha = $3
        WHERE id = $4
        RETURNING id, nome, login, cargo, permissoes
      `;
      const { rows } = await pool.query(query, [
        cargo,
        JSON.stringify(permissoes),
        senha.trim(),
        id,
      ]);
      return rows[0];
    } else {
      const query = `
        UPDATE usuarios 
        SET cargo = $1, permissoes = $2::jsonb
        WHERE id = $3
        RETURNING id, nome, login, cargo, permissoes
      `;
      const { rows } = await pool.query(query, [
        cargo,
        JSON.stringify(permissoes),
        id,
      ]);
      return rows[0];
    }
  }

  async excluirUsuario(id) {
    await pool.query('DELETE FROM usuarios WHERE id = $1 AND login != $2', [id, 'admin']);
  }
}

module.exports = new AuthService();