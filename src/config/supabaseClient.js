const arquivoConfiguracao = require('path').resolve(__dirname, '../../.env');
const configuracao = require('dotenv').config({ path: arquivoConfiguracao, override: true });
const { createClient } = require('@supabase/supabase-js'); //conexão de usuario com o supabase

if (configuracao.error) throw new Error('Não foi possível ler o .env da pasta SafeNest.');
const dadosLocais = configuracao.parsed;
const enderecoLocal = new URL(dadosLocais.SUPABASE_URL);
if (enderecoLocal.protocol !== 'http:' ||
    !['127.0.0.1', 'localhost'].includes(enderecoLocal.hostname) ||
    enderecoLocal.port !== '54321' || !dadosLocais.SUPABASE_KEY) {
    throw new Error('A API aceita somente o Supabase local do Docker na porta 54321. Confira SUPABASE_URL e SUPABASE_KEY no .env da pasta SafeNest.');
}

const supabase = createClient(
    'http://127.0.0.1:54321',
    dadosLocais.SUPABASE_KEY
);
console.log('BANCO LOCAL: Supabase do Docker em http://127.0.0.1:54321');

module.exports = supabase;
