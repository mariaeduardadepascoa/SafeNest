//criação dessa pasta e git: 23/03/2026

//primeiro git add/commit/push: escreve na branch do canto esquerdo oq se trata e envia, depois so att o github
// ou escreve isso no terminal: git add . -----> git commit -m "mensagem explicando a mudança feita" -----> git push origin main

var nfc_lido = false;
var porta_abriu = true;
var vibracao_fraca = false;

var resultadoAcesso = verificarAcesso(nfc_lido, porta_abriu, vibracao_fraca);
console.log(resultadoAcesso);

function verificarAcesso (nfc_lido, porta_abriu, vibracao_fraca) {
    if (nfc_lido == true && vibracao_fraca == true) {
        return "Acesso AUTORIZADO";
    } else if (nfc_lido == false && vibracao_fraca == false && porta_abriu == true) {
        return "Alerta ARROMBAMENTO";
    } else if (nfc_lido == false && vibracao_fraca == true && porta_abriu == true) {
        return "Acesso AUTORIZADO (chave física)";
    }

    return "Sistema fora do ar/situação não reconhecida" //return para caso nao caia em nenhum dos if's
}