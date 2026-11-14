const express = require('express');
const cors = require('cors');

const veiculosRoutes = require('./routes/veiculosRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const financeiroRoutes = require('./routes/financeiroRoutes');
const relatoriosRoutes = require('./routes/relatoriosRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Registro das Rotas
app.use('/auth', authRoutes);
app.use('/veiculos', veiculosRoutes);
app.use('/clientes', clientesRoutes);
app.use('/financeiro', financeiroRoutes);
app.use('/relatorios', relatoriosRoutes);

//const PORT = 3000;
//app.listen(3000, '0.0.0.0', () => {
 // console.log('🚀 Servidor rodando na rede em http://192.168.50.103:3000');
//});
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});