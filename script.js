//criação dessa pasta e git: 23/03/2026

//primeiro git add/commit/push: escreve na branch do canto esquerdo oq se trata e envia, depois so att o github
// ou escreve isso no terminal: git add . -----> git commit -m "mensagem explicando a mudança feita" -----> git push origin main

// var nfc_lido = false;
// var porta_abriu = true;
// var vibracao_fraca = false;

// var resultadoAcesso = verificarAcesso(nfc_lido, porta_abriu, vibracao_fraca);
// console.log(resultadoAcesso);

// function verificarAcesso (nfc_lido, porta_abriu, vibracao_fraca) {
//     if (nfc_lido == true && vibracao_fraca == true) {
//         return "Acesso AUTORIZADO";
//     } else if (nfc_lido == false && vibracao_fraca == false && porta_abriu == true) {
//         return "Alerta ARROMBAMENTO";
//     } else if (nfc_lido == false && vibracao_fraca == true && porta_abriu == true) {
//         return "Acesso AUTORIZADO (chave física)";
//     }

//     return "Sistema fora do ar/situação não reconhecida" //return para caso nao caia em nenhum dos if's
// }


function mostrarCards() {
    let fechadura = document.getElementById('fechadura');
    let camera = document.getElementById('camera');
    let alarmes = document.getElementById('alarmes');
    let appMobile = document.getElementById('app-mobile');

    let buttonVoltar = document.querySelector('.button-voltar');
    let buttonProximo = document.querySelector('.button-proximo');
    
    buttonProximo.addEventListener('click', function() {
        fechadura.classList.add('none');
        camera.classList.add('none');

        alarmes.classList.remove('none');
        appMobile.classList.remove('none');

        console.log('Botão de PRÓXIMO apertado');
    });

    buttonVoltar.addEventListener('click', function() {
        alarmes.classList.add('none');
        appMobile.classList.add('none');

        fechadura.classList.remove('none');
        camera.classList.remove('none');

        console.log('Botão de VOLTAR apertado');
    });
    
}



//entrar e cadastro

function alterarVisibilidade(){
    campo = document.getElementById('senha');
    olho = document.getElementById('olho');
    if(campo.type === 'password'){
        campo.type = "text";
        campo.placeholder = "Senha123#"
        olho.src = "imagens/olhoAberto.svg";
    }else if(campo.type === 'text'){
        campo.type = "password";
        campo.placeholder = "••••••••"
        olho.src = "imagens/olhoFechado.svg";
    }
}