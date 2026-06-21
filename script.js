//criação dessa pasta e git: 23/03/2026

//primeiro git add/commit/push: escreve na branch do canto esquerdo oq se trata e envia, depois so att o github
// ou escreve isso no terminal: git add . -----> git commit -m "mensagem explicando a mudança feita" -----> git push origin main
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

function alterarVisibilidade(idOlho,idCampo){
    campo = document.getElementById(idCampo);
    olho = document.getElementById(idOlho);
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




//comece a usar
const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("click", (e) => {

        e.stopPropagation();

        const aberto = card.classList.contains("ativo");

        cards.forEach(c => {
            c.classList.remove("ativo");
        });

        if (!aberto) {
            card.classList.add("ativo");
        }

    });

});

document.addEventListener("click", () => {

    cards.forEach(card => {
        card.classList.remove("ativo");
    });

});