// ANIMACOES DAS PARTES DO SITE
if (typeof window !== 'undefined' && typeof ScrollReveal === 'function') {
    window.revelar = ScrollReveal({ reset: false });

    // PRIMEIRA PARTE DO SITE
    revelar.reveal('.cartao-inicio', {
        duration: 700,
        distance: '90px',
        origin: 'right'
    });

    revelar.reveal('#titulo-inicial-page', {
        duration: 700,
        distance: '90px',
        origin: 'left'
    });

    revelar.reveal('#subtitulo-inicial-page', {
        duration: 700,
        distance: '90px',
        origin: 'left'
    });

    revelar.reveal('#wrapper-cadastro', {
        duration: 900,
        distance: '90px',
        origin: 'left'
    });

    revelar.reveal('#wrapper-como-funciona', {
        duration: 1100,
        distance: '90px',
        origin: 'left'
    });

    // RECURSOS
    revelar.reveal('#cuidar .cabecalho-recursos', {
        duration: 900,
        distance: '90px',
        origin: 'left'
    });

    revelar.reveal('#cuidar .cartao-recurso', {
        duration: 900,
        distance: '90px',
        origin: 'bottom',
        interval: 150
    });

    // PARTE DO APLICATIVO
    revelar.reveal('#app > div', {
        duration: 900,
        distance: '90px',
        origin: 'left'
    });

    revelar.reveal('#app .celular-aplicativo', {
        duration: 900,
        distance: '90px',
        origin: 'right'
    });

    // PASSO A PASSO
    revelar.reveal('#conecte > .texto-destaque, #conecte > h2', {
        duration: 900,
        distance: '90px',
        origin: 'bottom'
    });

    revelar.reveal('#conecte .passo-a-passo-item', {
        duration: 900,
        distance: '90px',
        origin: 'bottom',
        interval: 150
    });

    revelar.reveal('#conecte .acessibilidade', {
        duration: 900,
        distance: '90px',
        origin: 'bottom'
    });

    // COMPARACAO
    revelar.reveal('#comparativo > .texto-destaque, #comparativo > h2', {
        duration: 900,
        distance: '90px',
        origin: 'bottom'
    });

    revelar.reveal('#comparativo .introducao-comparacao', {
        duration: 900,
        distance: '90px',
        origin: 'bottom'
    });

    revelar.reveal('#comparativo .tabela-rolagem', {
        duration: 1000,
        distance: '90px',
        origin: 'left'
    });

    revelar.reveal('#comparativo .frase-comparacao', {
        duration: 1100,
        distance: '90px',
        origin: 'right'
    });

    // PERGUNTAS FREQUENTES
    revelar.reveal('#faq > div:first-child', {
        duration: 900,
        distance: '90px',
        origin: 'left'
    });

    revelar.reveal('#faq .lista-perguntas', {
        duration: 900,
        distance: '90px',
        origin: 'right'
    });

    revelar.reveal('#faq .caixa-ajuda', {
        duration: 900,
        distance: '90px',
        origin: 'bottom'
    });
}