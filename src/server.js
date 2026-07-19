// INICIALIZAÇÃO
require('dotenv').config();
const express = require('express');
const cors = require('cors'); //por padrão um site não pode chamar uma API que está em outro endereço/porta, o cors resolve isso
const routes = require('./routes/routes');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(cors()); // permite que o app e o site acessem a API
app.use(express.json()); //para conseguimos usar o req.body caso a req seja em json
app.use(routes);


app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`SAFENEST API rodando em http://localhost:${PORT}`);
});