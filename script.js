// MENU DO CABECALHO
const linksDoMenu = document.querySelectorAll('#links-header a');

linksDoMenu.forEach(link => {
    link.addEventListener('click', () => {
        linksDoMenu.forEach(item => {
            const linha = item.querySelector('.linha-menu');
            if (linha) {
                linha.classList.remove('ativo');
            }
        });

        const linhaAtiva = link.querySelector('.linha-menu');
        if (linhaAtiva) {
            linhaAtiva.classList.add('ativo');
        }
    });
});

// MUDA A COR DO CABECALHO QUANDO SAI DA PRIMEIRA SECAO
const cabecalho = document.querySelector('.cabecalho-site');
const primeiraSecao = document.getElementById('inicial-page');

function atualizarCabecalho() {
    if (!cabecalho || !primeiraSecao) return;

    const limite = primeiraSecao.offsetHeight - cabecalho.offsetHeight;
    cabecalho.classList.toggle('rolado', window.scrollY >= limite);
}

window.addEventListener('scroll', atualizarCabecalho, { passive: true });
window.addEventListener('resize', atualizarCabecalho);
atualizarCabecalho();

// MENU HAMBURGUER DO CELULAR
const linksCabecalho = document.getElementById('links-header');
const botaoMenu = document.getElementById('menu-toggle');

if (botaoMenu && linksCabecalho) {
    botaoMenu.addEventListener('click', () => {
        linksCabecalho.classList.toggle('aberto');
        botaoMenu.classList.toggle('ativo');
    });

    linksDoMenu.forEach(link => {
        link.addEventListener('click', () => {
            linksCabecalho.classList.remove('aberto');
            botaoMenu.classList.remove('ativo');
        });
    });
}

// BOTOES DO CARROSSEL DE RECURSOS
const gradeRecursos = document.getElementById('recursos-grid');
const proximoRecurso = document.getElementById('recursos-btn-next');
const recursoAnterior = document.getElementById('recursos-btn-prev');

if (gradeRecursos && proximoRecurso && recursoAnterior) {
    proximoRecurso.addEventListener('click', () => {
        gradeRecursos.scrollBy({ left: 350, behavior: 'smooth' });
    });

    recursoAnterior.addEventListener('click', () => {
        gradeRecursos.scrollBy({ left: -350, behavior: 'smooth' });
    });
}

// ABRIR E FECHAR AS PERGUNTAS DO FAQ
const perguntas = document.querySelectorAll('.item-pergunta');

perguntas.forEach(item => {
    const titulo = item.querySelector('.cabecalho-pergunta');

    if (!titulo) return;

    titulo.addEventListener('click', () => {
        const jaEstavaAberta = item.classList.contains('aberta');

        perguntas.forEach(outraPergunta => {
            outraPergunta.classList.remove('aberta');
            const icone = outraPergunta.querySelector('.icone-pergunta');
            if (icone) icone.textContent = '+';
        });

        if (!jaEstavaAberta) {
            item.classList.add('aberta');
            const icone = item.querySelector('.icone-pergunta');
            if (icone) icone.textContent = '-';
        }
    });
});

// BOTOES DE CATEGORIA, CASO ESTEJAM NA PAGINA
const botoesCategoria = document.querySelectorAll('.botao-categoria');

botoesCategoria.forEach(botao => {
    botao.addEventListener('click', () => {
        botoesCategoria.forEach(outroBotao => {
            outroBotao.classList.remove('ativo');
        });
        botao.classList.add('ativo');
    });
});

// MOSTRAR OU ESCONDER A SENHA NAS TELAS DE LOGIN E CADASTRO
function alterarVisibilidade(idOlho, idCampo) {
    const campo = document.getElementById(idCampo);
    const olho = document.getElementById(idOlho);

    if (!campo || !olho) return;

    if (campo.type === 'password') {
        campo.type = 'text';
        campo.placeholder = 'Senha123#';
        olho.src = 'imagens/olhoAberto.svg';
    } else {
        campo.type = 'password';
        campo.placeholder = '••••••••';
        olho.src = 'imagens/olhoFechado.svg';
    }
}

// ABRIR OS CARDS DO PASSO A PASSO
const cartoes = document.querySelectorAll('.card');

cartoes.forEach(cartao => {
    cartao.addEventListener('click', evento => {
        evento.stopPropagation();
        const jaEstavaAberto = cartao.classList.contains('ativo');

        cartoes.forEach(outroCartao => {
            outroCartao.classList.remove('ativo');
        });

        if (!jaEstavaAberto) {
            cartao.classList.add('ativo');
        }
    });
});

document.addEventListener('click', () => {
    cartoes.forEach(cartao => {
        cartao.classList.remove('ativo');
    });
});