// Inicializa o Express e junta tudo

const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');

const app = express();
const PORT = 3000;

app.use(cors()); // permite que o app e o site acessem a API
app.use(express.json()); // permite que a API entenda dados em formato JSON

//prefixo das rotas (todas vão começar com /api)
app.use('/api', routes);

//caso a rota do routes não existir
app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(PORT, () => {
    console.log(`SAFENEST API rodando na porta ${PORT}`);
});