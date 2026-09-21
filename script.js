// HEADER -> NAVEGAÇÃO
const linksHeader = document.querySelectorAll('#links-header a');

linksHeader.forEach(link => {
    link.addEventListener('click', () => {
        linksHeader.forEach(l => l.querySelector('.row').classList.remove('active'));
        link.querySelector('.row').classList.add('active');
    });
});


// SEÇÃO RECURSOS
function mostrarCards() {
    let fechadura = document.getElementById('fechadura');
    let camera = document.getElementById('camera');
    let alarmes = document.getElementById('alarmes');
    let appMobile = document.getElementById('app-mobile');

    let buttonVoltar = document.querySelector('.button-voltar');
    let buttonProximo = document.querySelector('.button-proximo');

    buttonProximo.addEventListener('click', function () {
        fechadura.classList.add('none');
        camera.classList.add('none');

        alarmes.classList.remove('none');
        appMobile.classList.remove('none');

        console.log('Botão de PRÓXIMO apertado');
    });

    buttonVoltar.addEventListener('click', function () {
        alarmes.classList.add('none');
        appMobile.classList.add('none');

        fechadura.classList.remove('none');
        camera.classList.remove('none');

        console.log('Botão de VOLTAR apertado');
    });

}


// TELAS DE LOGIN E CADASTRO

function alterarVisibilidade(idOlho, idCampo) {
    let campo = document.getElementById(idCampo);
    let olho = document.getElementById(idOlho);
    
    if (campo.type === 'password') {
        campo.type = "text";
        campo.placeholder = "Senha123#"
        olho.src = "imagens/olhoAberto.svg";
    } else if (campo.type === 'text') {
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