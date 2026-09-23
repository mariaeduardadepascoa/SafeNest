// HEADER -> NAVEGAÇÃO
const linkItems = document.querySelectorAll('#links-header a');

linkItems.forEach(link => {
    link.addEventListener('click', () => {
        linkItems.forEach(l => {
            const row = l.querySelector('.row');
            if (row) row.classList.remove('active');
        });
        const activeRow = link.querySelector('.row');
        if (activeRow) activeRow.classList.add('active');
    });
});

// BOTÃO HAMBURGUER
const linksHeader = document.getElementById('links-header');
const menuToggle = document.getElementById('menu-toggle');

if (menuToggle && linksHeader) {
    menuToggle.addEventListener('click', function () {
        linksHeader.classList.toggle('open');
        menuToggle.classList.toggle('active');
    });

    linkItems.forEach(link => {
        link.addEventListener('click', function () {
            linksHeader.classList.remove('open');
            menuToggle.classList.remove('active');
        });
    });
}

// GRID DA SEÇÃO RECURSOS (CARROSSEL)
const grid = document.getElementById('recursos-grid');
const btnNext = document.getElementById('recursos-btn-next');
const btnPrev = document.getElementById('recursos-btn-prev');

if (grid && btnNext && btnPrev) {
    btnNext.addEventListener('click', () => {
        grid.scrollBy({ left: 350, behavior: 'smooth' });
    });

    btnPrev.addEventListener('click', () => {
        grid.scrollBy({ left: -350, behavior: 'smooth' });
    });
}




document.addEventListener("DOMContentLoaded", function () {
  const itensPergunta = document.querySelectorAll(".item-pergunta");

  itensPergunta.forEach((item) => {
    const cabecalho = item.querySelector(".cabecalho-pergunta");

    cabecalho.addEventListener("click", () => {
      const estaAberto = item.classList.contains("aberta");

      itensPergunta.forEach((outroItem) => {
        outroItem.classList.remove("aberta");
        const icone = outroItem.querySelector(".icone-pergunta");
        if (icone) icone.textContent = "+";
      });

      if (!estaAberto) {
        item.classList.add("aberta");
        const icone = item.querySelector(".icone-pergunta");
        if (icone) icone.textContent = "-";
      }
    });
  });

  const botoesCategoria = document.querySelectorAll(".botao-categoria");

  botoesCategoria.forEach((botao) => {
    botao.addEventListener("click", () => {
      botoesCategoria.forEach((b) => b.classList.remove("ativo"));
      botao.classList.add("ativo");
    });
  });
});



// TELAS DE LOGIN E CADASTRO
function alterarVisibilidade(idOlho, idCampo) {
    let campo = document.getElementById(idCampo);
    let olho = document.getElementById(idOlho);

    if (campo && olho) {
        if (campo.type === 'password') {
            campo.type = "text";
            campo.placeholder = "Senha123#";
            olho.src = "imagens/olhoAberto.svg";
        } else if (campo.type === 'text') {
            campo.type = "password";
            campo.placeholder = "••••••••";
            olho.src = "imagens/olhoFechado.svg";
        }
    }
}

// comece a usar
const cards = document.querySelectorAll(".card");

cards.forEach(card => {
    card.addEventListener("click", (e) => {
        e.stopPropagation();
        const aberto = card.classList.contains("ativo");

        cards.forEach(c => c.classList.remove("ativo"));

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